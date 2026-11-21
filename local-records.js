(() => {
  const STORE = 'noor-local-records-v1';
  const originalFetch = window.fetch.bind(window);
  const read = () => {
    try { return JSON.parse(localStorage.getItem(STORE) || '{"collections":{},"keys":{}}'); }
    catch { return {collections:{},keys:{}}; }
  };
  const write = (db) => localStorage.setItem(STORE, JSON.stringify(db));
  const response = (data, status=200) => new Response(JSON.stringify({data}), {
    status, headers:{'content-type':'application/json; charset=utf-8'}
  });
  const id = () => 'noor_' + Date.now().toString(36) + '_' + Math.random().toString(36).slice(2,10);
  window.fetch = async function(input, init={}) {
    let url = '';
    try { url = typeof input === 'string' ? input : input.url; } catch {}
    if (!/(^|\/)actions(?:\?|$)/.test(url)) return originalFetch(input, init);
    let payload;
    try { payload = JSON.parse(init.body || '{}'); } catch { return response({error:'Invalid JSON'},400); }
    const args = payload.args || {};
    const collection = args.collection || 'items';
    const db = read();
    db.collections[collection] ||= [];
    const rows = db.collections[collection];
    const action = payload.action;
    try {
      let data = null;
      if (action === 'records.list') {
        data = {records: rows.map(x => ({id:x.id,value:x.value,created_at:x.created_at}))};
      } else if (action === 'records.create') {
        const key = args.idempotency_key;
        if (key && db.keys[collection + ':' + key]) data = {id:db.keys[collection + ':' + key]};
        else {
          const rid = id();
          rows.push({id:rid,value:args.value ?? {},created_at:new Date().toISOString()});
          if (key) db.keys[collection + ':' + key] = rid;
          data = {id:rid};
        }
      } else if (action === 'records.replace' || action === 'records.put') {
        const at = rows.findIndex(x => x.id === args.id);
        if (at < 0) return response({error:'Record not found'},404);
        rows[at].value = args.value ?? args.record ?? {};
        data = {id:args.id};
      } else if (action === 'records.get') {
        const found = rows.find(x => x.id === args.id);
        if (!found) return response({error:'Record not found'},404);
        data = found;
      } else if (action === 'records.delete') {
        const before = rows.length;
        db.collections[collection] = rows.filter(x => x.id !== args.id);
        data = db.collections[collection].length !== before;
      } else {
        return response({error:'Unsupported local action: ' + action},400);
      }
      write(db);
      return response(data);
    } catch (error) {
      return response({error:error.message || 'Local storage error'},500);
    }
  };
})();
