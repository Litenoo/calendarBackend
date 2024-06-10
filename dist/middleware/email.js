export async function sendWelcomeEmail(userData) {
    console.log('sendWelcome Email !   ', userData);
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
            'subject': 'Thanks for creating account in calendarApp',
            'personalization': [
                {
                    'email': `${userData.email}`,
                    'data': {
                        'name': 'support noreply',
                        'account_name': 'noreply',
                        'support_email': 'supportCalendarApp@example.com',
                    }
                }
            ],
            'template_id': `${process.env.WELCOME_TEMPLATE_ID}`,
        })
    });
}
//# sourceMappingURL=email.js.map