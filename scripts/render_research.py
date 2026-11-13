#!/usr/bin/env python3
"""Render the site's native research figures from frozen, published inputs."""
import argparse
import hashlib
import html
import json
import math
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
DATA = json.loads((ROOT / 'assets/data/spirit-research.json').read_text())
START = '<!-- SPIRIT research panels:start -->'
END = '<!-- SPIRIT research panels:end -->'

def esc(value):
    return html.escape(str(value), quote=True)

def text(x, y, value, cls='axis-label', anchor='middle'):
    return f'<text x="{x:.2f}" y="{y:.2f}" class="{cls}" text-anchor="{anchor}">{esc(value)}</text>'

def line(x1, y1, x2, y2, cls='plot-grid'):
    return f'<line x1="{x1:.2f}" y1="{y1:.2f}" x2="{x2:.2f}" y2="{y2:.2f}" class="{cls}"/>'

def circle(x, y, radius=3, cls='plot-point', title=None):
    child = f'<title>{esc(title)}</title>' if title else ''
    return f'<circle cx="{x:.2f}" cy="{y:.2f}" r="{radius}" class="{cls}">{child}</circle>'

def path(points, cls='plot-line', close=False):
    points = list(points)
    coords = ' '.join(('M' if i == 0 else 'L') + f'{x:.2f},{y:.2f}' for i, (x, y) in enumerate(points))
    return f'<path d="{coords}{"Z" if close else ""}" class="{cls}"/>'

def svg(name, title, description, body, height=260):
    return (f'<svg class="research-chart" viewBox="0 0 440 {height}" role="img" '
            f'aria-labelledby="{name}-title {name}-desc">'
            f'<title id="{name}-title">{esc(title)}</title>'
            f'<desc id="{name}-desc">{esc(description)}</desc>{body}</svg>')

def axes(xmin, xmax, ymin, ymax, xticks, yticks, left=45, right=421, top=20, bottom=218):
    X = lambda value: left + (value - xmin) / (xmax - xmin) * (right - left)
    Y = lambda value: bottom - (value - ymin) / (ymax - ymin) * (bottom - top)
    body = ''
    for value, label in yticks:
        body += line(left, Y(value), right, Y(value)) + text(left - 10, Y(value) + 4, label, anchor='end')
    for value, label in xticks:
        body += text(X(value), bottom + 24, label, anchor='end' if X(value)>410 else 'middle')
    body += line(left, bottom, right, bottom, 'plot-axis')
    return X, Y, body

def quantile(values, q):
    values = sorted(values)
    where = (len(values) - 1) * q
    lo, hi = math.floor(where), math.ceil(where)
    return values[lo] + (values[hi] - values[lo]) * (where - lo)

def motivation_scatter():
    configs = DATA['motivation']['configurations']
    X, Y, body = axes(0.695, 1.005, 19.3, 27.4, [(v, str(round(v*100))) for v in [.7,.8,.9,1]], [(v,str(v)) for v in [20,22,24,26]])
    low, high = DATA['motivation']['band']
    band = [c for c in configs if low <= c[1] <= high]
    bottom, top = min(c[2] for c in band), max(c[2] for c in band)
    body += f'<rect x="{X(low):.2f}" y="{Y(top):.2f}" width="{X(high)-X(low):.2f}" height="{Y(bottom)-Y(top):.2f}" class="plot-band"/>'
    for ratio, acceptance, throughput in configs:
        if acceptance >= .7:
            body += circle(X(acceptance),Y(throughput),2.7,'plot-cloud',
                           f'Acceptance {acceptance:.2%}; {throughput:.3f} tokens/s; skip ratio {ratio:.3f}')
    agreement = max(configs, key=lambda c:c[1])
    fastest = max(configs, key=lambda c:c[2])
    body += circle(X(agreement[1]),Y(agreement[2]),5.5,'plot-hollow',f'Highest acceptance: {agreement[1]:.2%}, {agreement[2]:.2f} tokens/s')
    body += circle(X(fastest[1]),Y(fastest[2]),5.5,'plot-emphasis',f'Highest throughput: {fastest[1]:.2%}, {fastest[2]:.2f} tokens/s')
    body += text(X(agreement[1])-10,Y(agreement[2])+5,f'{agreement[2]:.2f}','plot-value',anchor='end')
    body += text(X(fastest[1])-8,Y(fastest[2])-12,f'{fastest[2]:.2f}','plot-value accent-value',anchor='end')
    return svg('acceptance-throughput','Acceptance does not uniquely determine throughput',
               '400 of 504 measured configurations with at least 70% acceptance. The highest acceptance is 99.41% at 24.36 tokens per second; the highest throughput is 26.39 tokens per second at 98.02% acceptance. In the highlighted approximately 96–98% acceptance band, throughput spans 21.99–26.39 tokens per second.',body)

def motivation_frontier():
    configs=DATA['motivation']['configurations']
    ratios=sorted({c[0] for c in configs})
    groups={r:[c[2] for c in configs if c[0]==r] for r in ratios}
    X,Y,body=axes(.295,.615,14,28,[(v,f'{v:.1f}') for v in [.3,.4,.5,.6]],[(v,str(v)) for v in [15,20,25]])
    area=[(X(r),Y(quantile(groups[r],.25))) for r in ratios]+[(X(r),Y(quantile(groups[r],.75))) for r in reversed(ratios)]
    body+=path(area,'plot-iqr',True)
    for ratio,acceptance,throughput in configs:
        body+=circle(X(ratio),Y(throughput),2.2,'plot-cloud')
    body+=path(((X(r),Y(quantile(groups[r],.5))) for r in ratios),'plot-line neutral-line')
    body+=path(((X(r),Y(max(groups[r]))) for r in ratios))
    for r in ratios:body+=circle(X(r),Y(max(groups[r])),2.6,'plot-emphasis')
    return svg('ratio-frontier','Skip ratio structures the throughput landscape',
               'All 504 configurations: 21 skip ratios and 24 layer patterns per ratio. The blue line is the best measured throughput at each ratio, the gray line is the median, and the shaded band is the middle 50% of configurations, not a confidence interval.',body)

def ratio_schematic():
    body=line(30,177,420,177,'plot-axis')+text(424,181,'r','axis-label',anchor='start')
    body+=line(30,104,416,104,'leader-bound')
    for x,mean,upper,lower,role in [(54,143,121,163,'ruled'),(132,119,78,151,'rival'),(220,79,57,104,'leader'),(340,105,74,144,'rival'),(404,147,126,165,'ruled')]:
        body+=line(x,upper,x,lower,'confidence '+role)+line(x-6,upper,x+6,upper,'confidence '+role)+line(x-6,lower,x+6,lower,'confidence '+role)
        body+=circle(x,mean,4,'confidence-point '+role)
    body+=text(416,94,'Leader’s lower bound','schematic-note teal-value',anchor='end')
    body+=line(220,187,340,187,'plot-line')+circle(280,187,5,'plot-hollow')
    body+=text(280,216,'Probe the wider gap’s midpoint','schematic-note')
    return svg('ratio-confidence','Confidence-guided ratio search, schematic',
               'The leader has the highest mean score. Ratios whose upper bound reaches the leader’s lower bound remain rivals. Probe the midpoint of the wider unresolved interval, then update bounds. This is an algorithm illustration, not measured data.',body,238)

def fp16_tables():
    result=''
    for model in ['13B-Chat','13B','70B']:
        result+=f'<div class="model-table-card"><table class="model-table"><caption>LLaMA-2-{model}</caption><thead><tr><th scope="col">Task</th><th scope="col">SWIFT</th><th scope="col">D&amp;V</th><th scope="col">SPIRIT</th></tr></thead><tbody>'
        for task in ['CNN/DM','GSM8K','TinyStories']:
            values={r['method']:r['speedup'] for r in DATA['fp16'] if r['model']==model and r['task']==task}
            assert values['SPIRIT']>max(values['SWIFT'],values['D&V'])
            result+=f'<tr><th scope="row">{task}</th><td>{values["SWIFT"]:.2f}</td><td>{values["D&V"]:.2f}</td><td><strong>{values["SPIRIT"]:.2f}</strong></td></tr>'
        result+='</tbody></table></div>'
    return result

def specbench():
    rows=DATA['specbench']['post']
    tasks=['Translation','Summarization','QA','Math','RAG','Multi-turn']
    X=lambda value:148+(value-1)/.65*273
    body=''
    for tick in [1,1.2,1.4,1.6]:
        body+=line(X(tick),14,X(tick),230)+text(X(tick),253,f'{tick:.1f}')
    descriptions=[]
    for i,task in enumerate(tasks):
        y=31+i*36
        pair=[next(r for r in rows if r['task']==task and r['method']==m) for m in ['SWIFT','SPIRIT']]
        body+=text(135,y+4,task,anchor='end')+line(X(pair[0]['mean']),y,X(pair[1]['mean']),y,'comparison-link')
        for r in pair:
            cls='comparison-spirit' if r['method']=='SPIRIT' else 'comparison-baseline'
            low,high=r['mean']-r['sd'],r['mean']+r['sd']
            body+=line(X(low),y,X(high),y,cls)+line(X(low),y-3,X(low),y+3,cls)+line(X(high),y-3,X(high),y+3,cls)
            body+=circle(X(r['mean']),y,4.2,'plot-emphasis' if r['method']=='SPIRIT' else 'plot-hollow',
                         f'{task}, {r["method"]}: {r["mean"]:.3f} ± {r["sd"]:.3f}')
        descriptions.append(task+': '+', '.join(f'{r["method"]} {r["mean"]:.3f} ± {r["sd"]:.3f}' for r in pair))
    return svg('specbench-tasks','Post-adaptation SpecBench results', 'Speedup over AR, three-seed means with standard deviations. '+'; '.join(descriptions),body,270)

def discovery():
    X,Y,body=axes(0,310,.98,1.73,[(v,str(v)) for v in [0,100,200,300]],[(v,f'{v:.1f}') for v in [1,1.2,1.4,1.6]])
    body+=line(X(0),Y(1),X(310),Y(1),'ar-reference')
    descriptions=[]
    for method,cls in [('D&V','third-line'),('SWIFT','neutral-line'),('SPIRIT','')]:
        rows=DATA['discovery'][method]
        body+=path(((X(t),Y(best)) for t,current,best in rows),'plot-line best-line '+cls)
        body+=path(((X(t),Y(current)) for t,current,best in rows),'plot-line '+cls)
        for t,current,best in rows:
            body+=circle(X(t),Y(current),2.4,'series-point '+cls,f'{method}: {t:.2f} seconds, current {current:.3f}×, best {best:.3f}×')
        t,current,best=rows[-1]
        descriptions.append(f'{method}: final {current:.3f}×, best {best:.3f}×')
    body+=text(X(294.905922)-3,Y(1.61)-12,'1.61×','plot-value accent-value',anchor='end')
    return svg('discovery-trace','Published configuration-discovery trace',
               'Paper Figure 3a. Shared 20-request replay probes, LLaMA-2-13B, CNN/DM, FP16. Solid lines show the selected configuration, dashed lines the best replay speedup found so far. '+'; '.join(descriptions),body)

def ablation_table():
    result='<table class="compact-evidence-table"><caption>Mean speedup / AR · three tasks per model</caption><thead><tr><th scope="col">Variant</th><th scope="col">13B</th><th scope="col">70B</th></tr></thead><tbody>'
    for field,label in [('throughput','Full SPIRIT'),('acceptance','Acceptance only'),('fixed_ratio','Fixed <i>r</i> = 0.5')]:
        result+='<tr><th scope="row">'+label+'</th>'
        result+=''.join(f'<td>{"<strong>" if field=="throughput" else ""}{r[field]:.2f}×{"</strong>" if field=="throughput" else ""}</td>' for r in DATA['ablation'])
        result+='</tr>'
    return result+'</tbody></table>'


def architecture_table():
    result='<table class="validation-table" aria-describedby="architecture-scope"><caption>Decode speedup / matched AR</caption><thead><tr><th scope="col">Model</th><th scope="col">BF16 draft</th><th scope="col">NF4 draft</th></tr></thead><tbody>'
    for row in DATA['architecture']:
        result+=f'<tr><th scope="row">{esc(row["model"])}<span class="validation-context">{esc(row["family"])}</span></th><td>{row["bf16"]:.3f}×</td><td><strong>{row["nf4"]:.3f}×</strong></td></tr>'
    return result+'</tbody></table>'

def code_table():
    result='<table class="validation-table" aria-describedby="code-scope"><caption>Greedy decoding on HumanEval</caption><thead><tr><th scope="col">Model</th><th scope="col">Speedup / AR</th><th scope="col">Pass@1</th></tr></thead><tbody>'
    for row in DATA['code_greedy']:
        assert row['ar_pass_at_1']==row['spirit_pass_at_1']
        result+=f'<tr><th scope="row">{esc(row["model"])}</th><td><strong>{row["speedup"]:.2f}×</strong></td><td>{row["spirit_pass_at_1"]:.1%}</td></tr>'
    return result+'</tbody></table>'

def cost():
    X,Y,body=axes(0,3,0,840,[],[(v,str(v)) for v in [0,200,400,600,800]])
    desc=[]
    for center,row in zip([142,322],DATA['cost']):
        total=0
        for key in ['draft','verify','other','update']:
            value=row[key]
            body+=f'<rect x="{center-35}" y="{Y(total+value):.2f}" width="70" height="{Y(total)-Y(total+value):.2f}" class="cost-{key}"><title>{row["method"]} {key}: {value:.3f} normalized ms</title></rect>'
            total+=value
        body+=text(center,Y(total)-10,f'{total:.1f}','plot-value '+('accent-value' if row['method']=='SPIRIT' else ''))
        body+=text(center,243,row['method'])
        desc.append(f'{row["method"]}: {total:.1f} normalized milliseconds; {row["update_share"]:.1f}% update share')
    return svg('controller-cost','Normalized adaptation-window cost', '; '.join(desc)+'. Paper Figure 3b: step-normalized window timing on LLaMA-2-13B, CNN/DM, FP16; 13 requests, one seed. SPIRIT window means are divided by six speculative steps; SWIFT uses window means.',body)

def reuse():
    X,Y,body=axes(0,3,0,1.9,[],[(v,f'{v:.1f}') for v in [0,1,1.5]])
    body+=line(45,Y(1),421,Y(1),'ar-reference')
    descriptions=[]
    for center,row in zip([140,327],DATA['reuse']):
        for offset,key,cls in [(-26,'without','bar-baseline'),(26,'with','bar-reuse')]:
            value=row[key]
            body+=f'<rect x="{center+offset-20}" y="{Y(value):.2f}" width="40" height="{Y(0)-Y(value):.2f}" class="{cls}"/>'
            body+=text(center+offset,Y(value)-10,f'{value:.2f}×','plot-value '+('teal-value' if key=='with' else ''))
        body+=text(center,243,row['model'])
        descriptions.append(f'{row["model"]}: without reuse {row["without"]:.2f}×, with reuse {row["with"]:.2f}×')
    return svg('reuse-results','Profile reuse under recurring workload shifts',
               '600-request FP16 streams with a task change every 100 requests. Speedup over AR. '+'; '.join(descriptions),body)

def sustained(early=False):
    values=DATA['sustained']
    n=50 if early else 1000
    X,Y,body=axes(1,n,.95,2.82,[(v,str(v)) for v in ([1,25,50] if early else [1,250,500,750,1000])],[(v,f'{v:.1f}') for v in [1,1.5,2,2.5]])
    if early:
        body=f'<rect x="{X(1):.2f}" y="20" width="{X(20)-X(1):.2f}" height="198" class="search-region"/><rect x="{X(20):.2f}" y="20" width="{X(50)-X(20):.2f}" height="198" class="reuse-region"/>'+body
        body+=line(X(20),20,X(20),218,'phase-boundary')
        body+=text(X(10),42,'Search','schematic-note accent-value')+text(X(35),42,'Reuse','schematic-note teal-value')
    body+=line(45,Y(1),421,Y(1),'ar-reference')
    for series in values['runs'].values():
        body+=path(((X(i+1),Y(value)) for i,value in enumerate(series[:n])),'run-line')
    body+=path(((X(i+1),Y(value)) for i,value in enumerate(values['pooled'][:n])),'plot-line pooled-line')
    if early:
        value=values['pooled'][19]
        body+=circle(X(20),Y(value),4,'plot-emphasis')
        body+=text(X(20)+10,Y(value)+23,f'{value:.2f}×','plot-value accent-value',anchor='start')
    else:
        body+=circle(X(1000),Y(values['pooled'][-1]),4,'plot-emphasis')
        body+=text(416,43,'2.46× pooled','plot-value accent-value',anchor='end')
    return svg('sustained-'+('early' if early else 'full'),'Cumulative decode speedup, '+('first 50 requests' if early else '1,000 requests'),
               'Eight runs with distinct controller seeds, each starting from an empty controller on the same ordered 1,000-request TinyStories stream. LLaMA-2-13B uses fused NF4 self-drafts with full FP16 verification. Gray lines show individual runs; the blue curve uses each method’s token and time totals pooled across runs. Cumulative throughput stays above AR throughout adaptation in all eight runs. Full-stream speedup is 2.46× pooled and 2.48× for the best run. '+('Search and reuse phases in the first 50 requests.' if early else ''),body)

def precision():
    row=next(r for r in DATA['precision'] if r['task']=='Overall')
    X,Y,body=axes(0,3,0,2.3,[],[(v,f'{v:.1f}') for v in [0,1,2]])
    body+=line(45,Y(1),421,Y(1),'ar-reference')
    for center,key,label,cls in [(142,'fp16','FP16','bar-baseline'),(322,'nf4','NF4','bar-spirit')]:
        value,lo,hi=(row[key+suffix] for suffix in ['_speedup','_ci_low','_ci_high'])
        body+=f'<rect x="{center-34}" y="{Y(value):.2f}" width="68" height="{Y(0)-Y(value):.2f}" class="{cls}"/>'
        body+=line(center,Y(lo),center,Y(hi),'precision-interval')+line(center-7,Y(lo),center+7,Y(lo),'precision-interval')+line(center-7,Y(hi),center+7,Y(hi),'precision-interval')
        body+=text(center,Y(hi)-12,f'{value:.3f}×','plot-value '+('accent-value' if key=='nf4' else ''))+text(center,243,label)
    return svg('precision-results','Separate three-task draft-precision comparison',
               'LLaMA-2-13B, same full FP16 verifier, independently optimized draft configurations. Aggregate speedup over AR: FP16 1.603×, 95% interval 1.584–1.628; NF4 1.981×, interval 1.964–2.017. NF4 versus FP16 throughput ratio 1.236, request-paired bootstrap 95% interval 1.214–1.263. These are separate from the 1,000-request runs.',body)

def batch_strip():
    return ''.join(f'<div><dt>Batch {r["size"]}</dt><dd>{r["speedup"]:.2f}×</dd></div>' for r in DATA['batch'])

def build():
    substitutions={
        'motivation_scatter':motivation_scatter(),'motivation_frontier':motivation_frontier(),
        'ratio_schematic':ratio_schematic(),'fp16_tables':fp16_tables(),'specbench':specbench(),
        'discovery':discovery(),'ablation_table':ablation_table(),'cost':cost(),'reuse':reuse(),
        'architecture_table':architecture_table(),'code_table':code_table(),
        'sustained_full':sustained(),'sustained_early':sustained(True),'precision':precision(),'batch_strip':batch_strip()
    }
    panels=[]
    for name in ['problem','method','experiments']:
        panel=(ROOT/'scripts/research'/f'{name}.html').read_text()
        for key,value in substitutions.items():
            panel=panel.replace('{{'+key+'}}',value)
        assert not re.search(r'\{\{\w+\}\}',panel),name
        panels.append(panel.strip())
    return '\n'.join(panels)

def main():
    parser=argparse.ArgumentParser()
    parser.add_argument('--check',action='store_true')
    args=parser.parse_args()
    target=ROOT/'index.html'
    original=target.read_text()
    if START in original:
        start=original.index(START)
        end=original.index(END,start)+len(END)
        if original[end:end+1]=='\n': end+=1
    else:
        start=original.index('                <section class="research-panel" id="spirit-motivation"')
        end=original.index('                <button class="details-close"',start)
    rendered=original[:start]+START+'\n'+build()+'\n'+END+'\n'+original[end:]
    for name in ['styles.css','research.css','research.js']:
        digest=hashlib.sha256((ROOT/name).read_bytes()).hexdigest()[:12]
        if name not in rendered:
            tag=f'    <link rel="stylesheet" href="{name}?v={digest}">\n' if name.endswith('.css') else f'    <script src="{name}?v={digest}" defer></script>\n'
            rendered=rendered.replace('  </head>',tag+'  </head>',1)
        else:
            rendered=re.sub(re.escape(name)+r'\?v=[0-9a-f]+',name+'?v='+digest,rendered)
    if args.check:
        if rendered != original: raise SystemExit('Research figures need rebuilding: python3 scripts/render_research.py')
        print('Native research figures match their frozen inputs.')
    else:
        target.write_text(rendered)
        print(f'Rendered three native research sections ({len(rendered.encode()):,} HTML bytes).')

if __name__=='__main__':
    main()
