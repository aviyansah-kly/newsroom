from pathlib import Path

p=Path('index.html')
s=p.read_text()
marker='NEWSROOM_AI_LAYER_FIX_START'
if marker not in s:
    css='''\n/* NEWSROOM_AI_LAYER_FIX_START */\nbody.alt-editor-layout .agent-dock{z-index:360!important;isolation:isolate!important}\nbody.alt-editor-layout .agent-dock.open{z-index:360!important;visibility:visible!important;pointer-events:auto!important}\n/* NEWSROOM_AI_LAYER_FIX_END */\n'''
    if '</style></head>' not in s:
        raise SystemExit('style closing marker not found')
    s=s.replace('</style></head>',css+'</style></head>',1)
p.write_text(s)
