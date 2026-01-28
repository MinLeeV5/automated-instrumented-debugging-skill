interface Item {
  id: string;
  name: string;
  price: number;
}

const SESSION = 'bug-guest-order';

async function getCartItems(userId: string): Promise<Item[]> {
  const cart = await fetchCart(userId);
  const items = cart?.items || [];

  return items;
}

async function fetchCart(userId: string): Promise<{ items: Item[] } | null> {
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
  const items = await getCartItems(userId);
  const total = calculateTotal(items);

  return total;
}

async function main() {
  try {
    const total = await processOrder('guest');
    console.log(`Order total: $${total.toFixed(2)}`);
  } catch (err: any) {
    }
}

main();
