from store import new_store

def load_twice(batch):
    store = new_store()
    run(store, batch)
    run(store, batch)
    return len(store)

def run(store, batch):
    for row in batch:
        store[row['id']] = row
