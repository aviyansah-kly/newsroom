/* Cloudflare static-assets preflight: no network, deploy, or credential.
 * Ensure local route dependencies exist and .assetsignore does not omit them.
 */
const fs=require('node:fs');
const path=require('node:path');
const assert=require('node:assert/strict');
const configText=fs.readFileSync('wrangler.jsonc','utf8');
const config=JSON.parse(configText.replace(/^\s*\/\/.*$/gm,''));
assert.equal(config.assets.directory,'./','Newsroom is a static website');
assert.ok(!Object.prototype.hasOwnProperty.call(config,'main'),'Static site must not use index.html as Worker main');
const ignore=fs.readFileSync('.assetsignore','utf8').split(/\r?\n/).map(s=>s.trim()).filter(s=>s&&!s.startsWith('#'));
for(const entry of ['!/*.html','!/design-system/','!/design-system/foundations/','!/design-system/foundations/tokens.css','!/styles/','!/styles/*.css','!/scripts/','!/scripts/*.js','!/scripts/components/','!/scripts/components/*.js','!/assets/','!/assets/**']){
 assert.ok(ignore.includes(entry),'Public asset group must be allowed: '+entry);
}
const paths=new Set(['scripts/components/tag-input-model.js','design-system/foundations/tokens.css','styles/newsroom-theme-tokens.css','styles/newsroom-theme-components.css',
 'styles/newsroom-dark-mode.css','styles/newsroom-dark-mode-editor.css',
 'scripts/newsroom-shell.js','scripts/newsroom-editorial-reusable.js']);
const pages=['dashboard.html','articles.html','tags.html','index.html'];
for(const page of pages){
 const html=fs.readFileSync(page,'utf8');
 for(const match of html.matchAll(/<(?:script|link|img)\b[^>]*\b(?:src|href)=["']([^"']+)["']/gi)){
  let uri=match[1];
  if(!uri||/^(?:https?:|\/\/|data:|#|javascript:|\$\{)/i.test(uri))continue;
  uri=decodeURIComponent(uri.split(/[?#]/)[0]);
  if(uri.startsWith('/'))uri=uri.slice(1);
  if(!uri||uri.includes('..'))throw new Error(page+': unsafe asset URL '+uri);
  paths.add(uri);
 }
}
for(const match of fs.readFileSync('scripts/newsroom-shell.js','utf8').matchAll(/(?:src|href)\s*=\s*['"](styles\/[^'"]+|scripts\/[^'"]+)['"]/g)){
 paths.add(match[1]);
}
const missing=[...paths].filter(p=>!fs.existsSync(p));
assert.deepEqual(missing,[],'Missing local static assets');
for(const p of paths){
 const allowed=p==='design-system/foundations/tokens.css'?ignore.includes('!/design-system/')&&ignore.includes('!/design-system/foundations/')&&ignore.includes('!/design-system/foundations/tokens.css'):
  p.startsWith('styles/')?ignore.includes('!/styles/*.css'):
  p.startsWith('scripts/components/')?ignore.includes('!/scripts/components/')&&ignore.includes('!/scripts/components/*.js'):
  p.startsWith('scripts/')?ignore.includes('!/scripts/*.js'):
  p.startsWith('assets/')?ignore.includes('!/assets/**'):
  p.endsWith('.html')?ignore.includes('!/*.html'):
  false;
 assert.ok(allowed,'Asset likely omitted by .assetsignore: '+p);
}
console.log('PASS: Cloudflare static assets preflight', {routes:pages.length,localDependencies:paths.size,config:config.name});
