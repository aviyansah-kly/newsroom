/*
 * Newsroom TagInput — shared selection / suggestions behavior.
 *
 * DOM-free core; safe for the existing Tags and Keywords markup.
 * Prototype only: options come from existing CMS catalogue, not a network API.
 * API: create({ initial, max, catalogue, onChange }), state + mutations.
 */
(function(root,factory){
  'use strict';
  const lib=factory();
  if(typeof module==='object'&&module.exports)module.exports=lib;
  if(root)root.NewsroomTagInputModel=lib;
})(typeof window!=='undefined'?window:null,function(){
  'use strict';
  const normalize=value=>String(value??'').replace(/\s+/g,' ').trim();
  const key=value=>normalize(value).toLocaleLowerCase();
  const canonical=(list,max)=>{
    const result=[],seen=new Set();
    for(const item of Array.isArray(list)?list:[]){
      const value=normalize(item),id=key(value);
      if(!value||seen.has(id))continue;
      result.push(value);seen.add(id);
      if(result.length>=max)break;
    }
    return result;
  };
  function create({initial=[],max=5,catalogue=()=>[],onChange=()=>{}}={}){
    if(!Number.isInteger(max)||max<1)throw new TypeError('TagInput max must be a positive integer');
    if(typeof catalogue!=='function'||typeof onChange!=='function')throw new TypeError('TagInput callbacks must be functions');
    let items=canonical(initial,max);
    const getItems=()=>items.slice();
    const emit=()=>onChange(getItems());
    const has=value=>items.some(item=>key(item)===key(value));
    function add(input){
      const value=normalize(input);
      if(!value)return {ok:false,reason:'empty',items:getItems()};
      if(has(value))return {ok:false,reason:'duplicate',items:getItems()};
      if(items.length>=max)return {ok:false,reason:'limit',items:getItems()};
      items.push(value);emit();
      return {ok:true,items:getItems()};
    }
    function remove(value){
      const index=typeof value==='number'?value:items.findIndex(v=>key(v)===key(value));
      if(!Number.isInteger(index)||index<0||index>=items.length)return false;
      items.splice(index,1);emit();return true;
    }
    function replaceFirst(value){
      const next=normalize(value);
      if(next===items[0])return false;
      const rest=items.slice(1).filter(v=>key(v)!==key(next));
      items=canonical(next?[next,...rest]:rest,max);
      emit();return true;
    }
    function set(next){
      const cleaned=canonical(next,max);
      if(cleaned.join('\u0000')===items.join('\u0000'))return false;
      items=cleaned;emit();return true;
    }
    function suggestions(query,{count=8,showWithoutQuery=false}={}){
      const term=key(query);
      if((!term&&!showWithoutQuery)||items.length>=max)return [];
      let choices;
      try{choices=catalogue()}catch(error){choices=[]}
      const seen=new Set();
      return (Array.isArray(choices)?choices:[]).map(normalize).filter(value=>{
        const id=key(value);
        if(!value||seen.has(id)||has(value)||!id.includes(term))return false;
        seen.add(id);return true;
      }).slice(0,Math.max(0,count));
    }
    return Object.freeze({getItems,has,add,remove,replaceFirst,set,suggestions,max});
  }
  return Object.freeze({create,normalize});
});