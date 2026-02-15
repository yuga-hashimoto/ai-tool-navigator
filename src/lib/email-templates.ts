
export function getUpsellEmail1Hour(name: string) {
  return `
    <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
      <h1>Hi ${name || 'there'},</h1>
      <p>Thanks for your recent purchase! We hope you're excited to get started.</p>
      <p>We noticed you might be interested in some complementary items to get the most out of your tools.</p>
      <p><a href="${process.env.NEXT_PUBLIC_APP_URL}/" style="background: #2563eb; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Check out related tools</a></p>
    </div>
  `;
}

export function getUpsellEmail24Hour(name: string) {
  return `
    <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
      <h1>Still thinking about it?</h1>
      <p>Hi ${name || 'there'},</p>
      <p>It's been a day since your purchase. Don't forget to check out our premium add-ons.</p>
      <p><a href="${process.env.NEXT_PUBLIC_APP_URL}/" style="background: #2563eb; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">View Premium Add-ons</a></p>
    </div>
  `;
}

export function getUpsellEmail72Hour(name: string) {
  return `
    <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
      <h1>Exclusive Offer</h1>
      <p>Hi ${name || 'there'},</p>
      <p>As a valued customer, we have a special bundle deal just for you.</p>
      <p><a href="${process.env.NEXT_PUBLIC_APP_URL}/" style="background: #2563eb; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">See Your Offer</a></p>
    </div>
  `;
}
