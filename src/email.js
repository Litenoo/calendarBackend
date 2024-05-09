export async function sendWelcomeEmail(pool, username) {
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
                    'email': `${username}`
                }
            ],
            'subject': 'Email Recovery for your calendarApp account',
            'personalization': [
                {
                    'email': `${username}`,
                    'data': {
                        'name': 'support noreply',
                        'account_name': 'noreply',
                        'support_email': 'supportCalendarApp@example.com',
                    }
                }
            ],
            'template_id': `${process.env.TEMPLATE_ID}`,
        })
    });
}
