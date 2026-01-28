interface Item {
  id: string;
  name: string;
  price: number;
}

async function getCartItems(userId: string): Promise<Item[]> {
  const cart = await fetchCart(userId);
  return cart?.items || [];
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
  return subtotal + tax;
}

async function processOrder(userId: string): Promise<number> {
  const items = await getCartItems(userId);
  const total = calculateTotal(items);
  return total;
}

async function main() {
  const total = await processOrder('guest');
  console.log(`Order total: $${total.toFixed(2)}`);
}

main();
