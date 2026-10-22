/* Phase 3B — opt-in legacy Tags state bridge. No DOM or editor mutation.
 * The legacy inline Editor remains the single writer until parity QA is done.
 * This adapter offers a reusable, testable model for reconciliation. */
(function(root,factory){
  'use strict';
  const api=factory(typeof module==='object'&&module.exports
    ?require('./tag-input-model.js'):root?.NewsroomTagInputModel);
  if(typeof module==='object'&&module.exports)module.exports=api;
  if(root)root.NewsroomLegacyTagAdapter=api;
})(typeof window!=='undefined'?window:null,function(shared){
  'use strict';
  if(!shared?.create)throw new Error('NewsroomTagInputModel is required');
  const normalize=shared.normalize;
  function create({initial=[],catalogue=()=>[],max=5}={}){
    const model=shared.create({initial,max,catalogue});
    const same=(left,right)=>left.length===right.length&&left.every((v,i)=>v===right[i]);
    // Pull live state from legacy editor or restored draft, without altering it.
    function reconcile(values){
      const incoming=Array.isArray(values)?values:[];
      const normalized=shared.create({initial:incoming,max,catalogue}).getItems();
      if(same(model.getItems(),normalized))return false;
      return model.set(normalized);
    }
    const planAdd=value=>{
      const test=shared.create({initial:model.getItems(),max,catalogue});
      return test.add(value);
    };
    const planRemove=value=>{
      const test=shared.create({initial:model.getItems(),max,catalogue});
      const ok=test.remove(value);
      return {ok,items:test.getItems()};
    };
    return Object.freeze({
      getItems:model.getItems,
      reconcile,
      planAdd,
      planRemove,
      suggestions:model.suggestions,
      has:model.has,
      max,
      normalize
    });
  }
  return Object.freeze({create});
});
