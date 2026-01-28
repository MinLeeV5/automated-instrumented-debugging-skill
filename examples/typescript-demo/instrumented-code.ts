interface Item {
  id: string;
  name: string;
  price: number;
}

const SESSION = 'bug-guest-order';

async function getCartItems(userId: string): Promise<Item[]> {
  // #region DEBUG - bug-guest-order
  fetch('http://localhost:9876/log', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ session: SESSION, type: 'enter', fn: 'getCartItems', data: { userId } }),
  }).catch(() => { });
  // #endregion

  const cart = await fetchCart(userId);
  const items = cart?.items || [];

  // #region DEBUG - bug-guest-order
  fetch('http://localhost:9876/log', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ session: SESSION, type: 'var', fn: 'getCartItems', data: { itemsCount: items.length } }),
  }).catch(() => { });
  // #endregion

  return items;
}

async function fetchCart(userId: string): Promise<{ items: Item[] } | null> {
  // #region DEBUG - bug-guest-order
  fetch('http://localhost:9876/log', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ session: SESSION, type: 'enter', fn: 'fetchCart', data: { userId } }),
  }).catch(() => { });
  // #endregion

  if (userId === 'guest') {
    return null;
  }

  return {
    items: [
      { id: '1', name: 'Widget', price: 29.99 },
      { id: '2', name: 'Gadget', price: 49.99 }
    ]
  };
}

function calculateTotal(items: Item[]): number {
  const subtotal = items.reduce((sum, item) => sum + item.price, 0);
  const tax = subtotal * 0.1;
  const total = subtotal + tax;

  return total;
}

async function processOrder(userId: string): Promise<number> {
  // #region DEBUG - bug-guest-order
  fetch('http://localhost:9876/log', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ session: SESSION, type: 'enter', fn: 'processOrder', data: { userId } }),
  }).catch(() => { });
  // #endregion

  const items = await getCartItems(userId);
  const total = calculateTotal(items);

  return total;
}

async function main() {
  try {
    const total = await processOrder('guest');
    console.log(`Order total: $${total.toFixed(2)}`);
  } catch (err: any) {
    // #region DEBUG - bug-guest-order
    fetch('http://localhost:9876/log', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ session: SESSION, type: 'error', fn: 'main', data: { error: err.message } }),
    }).catch(() => { });
    // #endregion
  }
}

main();
