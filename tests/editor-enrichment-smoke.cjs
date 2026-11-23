const {chromium}=require('playwright');
const {mkdirSync}=require('node:fs');

(async()=>{
 const browser=await chromium.launch({headless:true,args:['--no-sandbox']});
 const page=await browser.newPage({viewport:{width:1440,height:900}});
 mkdirSync('artifacts',{recursive:true});
 const errors=[];
 page.on('pageerror',err=>errors.push(err.message));
 try {
  await page.goto('http://127.0.0.1:8765/index.html',{waitUntil:'domcontentloaded',timeout:45000});
  await page.waitForSelector('#nrEditorialEnrichment',{timeout:15000});
  if(await page.locator('#nrEditorialEnrichment .nr-enrich-card').count()!==3)throw Error('Three middle-column cards required');
  if(!await page.locator('.workspace > section > .paper > #nrEditorialEnrichment').count())throw Error('Enrichment must be placed after writing area, not right sidebar');
  if(await page.locator('.context #nrEditorialEnrichment').count())throw Error('Enrichment incorrectly mounted in right sidebar');
  const recipe=page.locator('#nrRecipeCard');
  const summary=page.locator('#nrSummaryCard');
  const faq=page.locator('#nrFaqCard');
  if(await page.locator('#nrRecipeBody').isVisible())throw Error('Optional recipe must start disabled');
  if(await page.locator('#nrSummaryBody').isVisible())throw Error('Optional Summary must start disabled');
  if(await page.locator('#nrFaqBody').isVisible())throw Error('Optional FAQ must start disabled');
  const recipeCheckbox=recipe.locator('#nrRecipeEnabled');
  const checkboxStyle=await recipeCheckbox.evaluate(el=>({
    width:getComputedStyle(el).width,height:getComputedStyle(el).height,
    radius:getComputedStyle(el).borderRadius,appearance:getComputedStyle(el).appearance
  }));
  if(checkboxStyle.width!=='16px'||checkboxStyle.height!=='16px'||checkboxStyle.radius!=='4px'||checkboxStyle.appearance!=='none')
    throw Error('Recipe checkbox must use Newsroom 16px DS control, got '+JSON.stringify(checkboxStyle));
  await recipeCheckbox.check();
  // Respect the Design System's 140ms checkbox transition before asserting the final selected color.
  await page.waitForTimeout(220);
  const checkedBackground=await recipeCheckbox.evaluate(el=>getComputedStyle(el).backgroundColor);
  if(checkedBackground==='rgba(0, 0, 0, 0)'||checkedBackground==='rgb(255, 255, 255)')
    throw Error('Recipe checkbox selected state is missing colored background');
  if(!await page.locator('#nrRecipeBody').isVisible())throw Error('Recipe checkbox did not reveal enabled form');
  await recipeCheckbox.uncheck();
  if(await page.locator('#nrRecipeBody').isVisible())throw Error('Unchecking Recipe did not collapse the form');
  await recipeCheckbox.check();
  if(await recipe.locator('.nr-enrich-schema-base input[readonly]').count()!==2)
    throw Error('Recipe must display read-only @context and @type fields');
  if(!await page.locator('#nrRecipeBody').isVisible())throw Error('Enable recipe did not reveal form');
  const chevrons=recipe.locator('.nr-enrich-details summary svg.nr-enrich-chevron');
  if(await chevrons.count()!==5)throw Error('Recipe section disclosure arrows must be Lucide icons');
  const arrowSize=await chevrons.first().evaluate(el=>{
    const rect=el.getBoundingClientRect();
    return {width:rect.width,height:rect.height,cssWidth:getComputedStyle(el).width,
      cssHeight:getComputedStyle(el).height,display:getComputedStyle(el).display};
  });
  if(Math.abs(arrowSize.width-12)>1||Math.abs(arrowSize.height-12)>1)
    throw Error('Recipe disclosure arrow should render at DS 12px size: '+JSON.stringify(arrowSize));
  await recipe.locator('[data-recipe-field="name"]').first().fill('Nasi Goreng Rumahan');
  await recipe.locator('[data-recipe-field="ingredients"]').first().fill('Nasi putih\nTelur\nMinyak');
  await recipe.locator('[data-recipe-field="instructions"]').first().fill('Panaskan minyak.\nTumis dan aduk nasi.');
  await recipe.locator('[data-recipe-field="cuisine"]').first().fill('Indonesian');
  await recipe.locator('[data-recipe-field="prep"]').first().fill('10');
  await recipe.locator('[data-recipe-field="cook"]').first().fill('15');
  await recipe.locator('[data-recipe-field="datePublished"]').first().fill('2026-11-23');
  await recipe.locator('[data-recipe-field="description"]').first().fill('Resep praktis nasi goreng.');
  await recipe.locator('.nr-enrich-details').filter({hasText:'Author'}).locator('summary').click();
  await recipe.locator('[data-recipe-field="authorName"]').first().fill('Dewi Santoso');
  await recipe.locator('.nr-enrich-details').filter({hasText:'Aggregate Rating'}).locator('summary').click();
  await recipe.locator('[data-recipe-field="ratingValue"]').first().fill('4.5');
  await recipe.locator('[data-recipe-field="reviewCount"]').first().fill('12');
  await recipe.locator('.nr-enrich-details').filter({hasText:'Nutrition'}).locator('summary').click();
  await recipe.locator('[data-recipe-field="servingSize"]').first().fill('1 porsi');
  await recipe.locator('[data-recipe-field="calories"]').first().fill('200 calories');
  await recipe.locator('[data-add-ingredient]').first().click();
  await recipe.locator('[data-recipe-ingredient]').first().fill('Garam');
  const schemaButtonStyle=await recipe.locator('#nrRecipeGenerate').evaluate(el=>({
    height:getComputedStyle(el).height,fontSize:getComputedStyle(el).fontSize
  }));
  if(schemaButtonStyle.height!=='40px'||schemaButtonStyle.fontSize!=='13px')
    throw Error('Schema action must use canonical Newsroom 40px / 13px button, received '+JSON.stringify(schemaButtonStyle));
  await recipe.locator('#nrRecipeGenerate').click();
  let schema=JSON.parse(await recipe.locator('#nrRecipeJSON').textContent());
  if(schema['@context']!=='https://schema.org'||schema['@type']!=='Recipe'||schema.name!=='Nasi Goreng Rumahan'||schema.recipeIngredient.length!==4||schema.recipeInstructions.length!==2||schema.totalTime!=='PT25M'||schema.author?.name!=='Dewi Santoso'||schema.datePublished!=='2026-11-23'||schema.aggregateRating?.ratingValue!==4.5||schema.nutrition?.calories!=='200 calories')throw Error('Invalid Single Recipe JSON-LD '+JSON.stringify(schema));
  await recipe.locator('[data-recipe-mode="listicle"]').click();
  if(!await recipe.locator('#nrAddRecipe').isVisible())throw Error('Listicle must allow adding recipes');
  await recipe.locator('#nrAddRecipe').click();
  if(await recipe.locator('[data-recipe-item]').count()!==2)throw Error('Listicle requires two recipe editors');
  const second=recipe.locator('[data-recipe-item]').nth(1);
  await second.locator('[data-recipe-field="name"]').fill('Sambal Tomat');
  await second.locator('[data-recipe-field="ingredients"]').fill('Tomat\nCabai');
  await second.locator('[data-recipe-field="instructions"]').fill('Haluskan semua bahan.');
  await recipe.locator('#nrRecipeGenerate').click();
  schema=JSON.parse(await recipe.locator('#nrRecipeJSON').textContent());
  if(schema['@graph']?.length!==2||schema['@graph'][1].name!=='Sambal Tomat')throw Error('Listicle preview must contain two Recipe objects');
  await page.screenshot({path:'artifacts/editor-recipe-listicle-light.png',fullPage:true});

  // Use a controlled article fixture rather than assuming the legacy editor
  // still has its original demo content after boot/autosave.
  await page.locator('#title').fill('Pemerintah Mengumumkan Kebijakan Harga Energi');
  await page.locator('#dek').fill('Pemerintah menjelaskan kebijakan terbaru mengenai harga energi dan menegaskan bahwa redaksi perlu memverifikasi detail informasi sebelum tayang.');
  // Recipe section Generate AI is isolated, source-grounded and requires editor acceptance.
  const firstRecipe=recipe.locator('[data-recipe-item]').first();
  if(await firstRecipe.locator('[data-recipe-generate]').count()!==6)
    throw Error('Recipe Details and each collapsible section require a Generate AI action');
  await firstRecipe.locator('[data-recipe-generate="details"]').click();
  if(!await firstRecipe.locator('.nr-enrich-basic-body [data-recipe-preview]').isVisible())
    throw Error('Recipe Details must display a reviewable AI Demo preview');
  const originalName=await firstRecipe.locator('[data-recipe-field="name"]').inputValue();
  if(originalName!=='Nasi Goreng Rumahan')
    throw Error('Recipe AI must not overwrite existing editor input before acceptance');
  await firstRecipe.locator('.nr-enrich-basic-body [data-recipe-apply]').click();
  if((await firstRecipe.locator('[data-recipe-field="name"]').inputValue())!=='Pemerintah Mengumumkan Kebijakan Harga Energi')
    throw Error('Recipe AI Demo suggestion must apply only after Use Suggestions');
  await firstRecipe.locator('[data-recipe-generate="rating"]').click();
  if(await firstRecipe.locator('.nr-enrich-details [data-recipe-apply]').count())
    throw Error('Recipe AI must not fabricate rating data');
  // Summary is opt-in and uses repeatable points instead of a single textarea.
  await summary.locator('#nrSummaryEnabled').check();
  if(!await summary.locator('#nrSummaryBody').isVisible())
    throw Error('Enabling Summary must reveal point editor');
  if(await summary.locator('[data-summary-item]').count()!==1)
    throw Error('Enabling a blank Summary should create Point 1');
  await summary.locator('[data-summary-point]').first().fill('Manual editorial point.');
  await summary.locator('#nrSummaryAdd').click();
  await summary.locator('[data-summary-point]').nth(1).fill('Second manual editorial point.');
  await summary.locator('[data-generate="summary"]').click();
  if(!await summary.locator('#nrSummarySuggestion').isVisible())
    throw Error('Summary Generate AI demo must show reviewable points');
  if((await summary.locator('[data-summary-point]').first().inputValue())!=='Manual editorial point.')
    throw Error('AI demo must not overwrite manual Summary points');
  const summaryDraft=await summary.locator('#nrSummaryDraft').textContent();
  if(!summaryDraft.includes('Pemerintah'))throw Error('Summary suggestion should use article text');
  const proposedSummaryCount=await summary.locator('#nrSummaryDraft p').count();
  await summary.locator('#nrSummaryApply').click();
  if(await summary.locator('[data-summary-item]').count()!==2+proposedSummaryCount)
    throw Error('Summary AI suggestions must append points after approval');
  const acceptedSummaryPoint=await summary.locator('[data-summary-point]').nth(2).inputValue();
  if(!acceptedSummaryPoint.includes('Pemerintah'))throw Error('Accepted summary must contain source text');
  await summary.locator('[data-summary-item]').nth(1).locator('[data-remove-summary]').click();
  if(await summary.locator('[data-summary-item]').count()!==1+proposedSummaryCount)
    throw Error('Remove Summary Point failed');
  await faq.locator('#nrFaqEnabled').check();
  if(!await faq.locator('#nrFaqBody').isVisible())throw Error('Enabling FAQ must reveal form');
  await faq.locator('[data-generate="faq"]').click();
  if(!await faq.locator('#nrFaqSuggestion').isVisible())throw Error('FAQ Generate AI demo must show preview');
  if(await faq.locator('[data-faq-item]').count())throw Error('FAQ should not be auto inserted until accepted');
  const proposedFaqCount=await faq.locator('#nrFaqDraft .nr-enrich-faq-preview').count();
  if(proposedFaqCount<1||proposedFaqCount>2)throw Error('FAQ Demo should propose 1–2 grounded questions');
  const faqDraftAnswer=await faq.locator('#nrFaqDraft .nr-enrich-faq-preview p').first().textContent();
  await faq.locator('#nrFaqApply').click();
  if(await faq.locator('[data-faq-item]').count()!==proposedFaqCount)throw Error('FAQ approval should apply each reviewed question');
  if((await faq.locator('[data-faq-field="answer"]').first().inputValue())!==faqDraftAnswer)throw Error('FAQ approved answer must equal the reviewed suggestion');
  await faq.locator('#nrFaqAdd').click();
  if(await faq.locator('[data-faq-item]').count()!==proposedFaqCount+1)throw Error('Add Question failed');
  await faq.locator('[data-faq-item]').last().locator('[data-faq-field="question"]').fill('Apa sumber data utama?');
  await faq.locator('[data-faq-item]').last().locator('[data-faq-field="answer"]').fill('Perlu verifikasi redaksi.');
  await faq.locator('[data-faq-item]').last().locator('[data-remove-faq]').click();
  if(await faq.locator('[data-faq-item]').count()!==proposedFaqCount)throw Error('Remove Question failed');
  await page.reload({waitUntil:'domcontentloaded',timeout:45000});
  await page.waitForSelector('#nrEditorialEnrichment');
  if(!await page.locator('#nrRecipeEnabled').isChecked())throw Error('Recipe enabled state not preserved in demo');
  if(await page.locator('[data-recipe-item]').count()!==2)throw Error('Listicle recipe fields not persisted');
  if((await page.locator('[data-recipe-ingredient]').first().inputValue())!=='Garam')throw Error('Dynamic ingredient did not persist');
  if((await page.locator('[data-recipe-field="authorName"]').first().inputValue())!=='Dewi Santoso')throw Error('Author details not persisted');
  if(!await page.locator('#nrSummaryEnabled').isChecked())throw Error('Summary enable state not persisted');
  if(!await page.locator('#nrFaqEnabled').isChecked())throw Error('FAQ enable state not persisted');
  if((await page.locator('[data-summary-point]').nth(1).inputValue())!==acceptedSummaryPoint)
    throw Error('Approved Summary point not persisted');
  if(await page.locator('[data-summary-item]').count()!==1+proposedSummaryCount)
    throw Error('Summary points not persisted');
  if(await page.locator('[data-faq-item]').count()!==proposedFaqCount)throw Error('FAQ drafts not persisted');
  await page.locator('#nrFaqEnabled').uncheck();
  if(await page.locator('#nrFaqBody').isVisible())throw Error('Disabling FAQ must hide its form');
  await page.locator('#nrFaqEnabled').check();
  if(await page.locator('[data-faq-item]').count()!==proposedFaqCount)
    throw Error('Disabling FAQ must not discard manual draft');
  await page.evaluate(()=>{document.documentElement.dataset.theme='dark'});
  await page.waitForTimeout(160);
  const color=await page.locator('#nrSummaryCard').evaluate(el=>getComputedStyle(el).backgroundColor);
  if(color==='rgb(255, 255, 255)')throw Error('Enrichment card remains white in dark mode');
  await page.screenshot({path:'artifacts/editor-enrichment-dark.png',fullPage:true});
  await page.setViewportSize({width:390,height:800});
  const overflow=await page.evaluate(()=>document.documentElement.scrollWidth-window.innerWidth);
  if(overflow>5)throw Error('Enrichment causes horizontal mobile overflow: '+overflow);
  if(!await page.locator('#nrSummaryCard [data-generate="summary"]').isVisible())throw Error('Generate AI hidden on mobile');
  await page.screenshot({path:'artifacts/editor-enrichment-mobile.png',fullPage:true});
  if(errors.length)throw Error('Browser errors: '+errors.slice(0,4).join('; '));
  console.log('PASS: Recipe Single/Listicle, section AI preview, Summary points, FAQ opt-in, persistence, Design System, Dark Mode, mobile');
 }finally{await browser.close();}
})().catch(err=>{console.error(err.stack||err);process.exitCode=1});