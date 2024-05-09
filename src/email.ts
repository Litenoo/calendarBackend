export async function sendWelcomeEmail(userData){
  await fetch(' https://api.mailersend.com/v1/email', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Requested-With': 'XMLHttpRequest',
      'Authorization': `Bearer ${process.env.MAIL_API_KEY}`,
    },
    body: JSON.stringify({
      'from': {
        'email': `${process.env.MAIL_SENDER}`
      },
      'to': [
        {
          'email': `${userData.email}`
        }
      ],
      'subject': 'Email Recovery for your calendarApp account',
      'personalization': [
        {
          'email': `${userData.email}`, //replace with users email
          'data': {
            'name': 'support noreply',
            'account_name': 'noreply',
            'support_email': 'supportCalendarApp@example.com',
            'link': `link`,
          }
        }
      ],
      'template_id': `${process.env.RECOVERY_TEMPLATE_ID}`,
    })
  });
}