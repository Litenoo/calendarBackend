var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
export function sendWelcomeEmail(userData) {
    return __awaiter(this, void 0, void 0, function* () {
        yield fetch(' https://api.mailersend.com/v1/email', {
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
                        'email': `${userData.email}`,
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
    });
}
