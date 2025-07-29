const TelegramBot = require('node-telegram-bot-api');
const express = require('express');
require('dotenv').config();

const app = express();
app.use(express.json());

if (!process.env.BOT_TOKEN || !process.env.WEBAPP_URL) {
  console.error('Missing required environment variables!');
  console.error('Please check that BOT_TOKEN and WEBAPP_URL are set in your .env file');
  process.exit(1);
}

const bot = new TelegramBot(process.env.BOT_TOKEN, { polling: true });

if (process.env.DEBUG) {
  bot.on('polling_error', (error) => console.log('Polling error:', error));
  bot.on('error', (error) => console.log('Bot error:', error));
}

const applications = new Map();
const adminSettings = {
  adminChatIds: [848907805],
  notificationsEnabled: true
};

async function handleStartCommand(msg) {
  const chatId = msg.chat.id;
  const userId = msg.from.id;
  const userName = msg.from.first_name || 'Пользователь';

  console.log(`📱 New user started bot: ${userName} (ID: ${userId})`);

  const welcomeText = `
🚀 Добро пожаловать в Технохантер, ${userName}!

Технохантер — это эффективный механизм ранней профессиональной интеграции студентов и аспирантов ведущих российских вузов в R&D-процессы технологичных компаний Москвы.

Нажмите кнопку ниже, чтобы открыть форму заявки:
  `;

  const webAppKeyboard = {
    keyboard: [
      [
        {
          text: '📋 Открыть форму заявки',
          web_app: {
            url: process.env.WEBAPP_URL
          }
        }
      ]
    ],
    resize_keyboard: true,
    one_time_keyboard: false
  };

  try {
    await bot.sendMessage(chatId, welcomeText, {
      reply_markup: webAppKeyboard,
      parse_mode: 'HTML'
    });
    console.log('✅ Welcome message sent successfully');
  } catch (error) {
    console.error('❌ Error sending welcome message:', error);
    await bot.sendMessage(chatId, 'Произошла ошибка. Отправьте команду /start еще раз.');
  }
}

bot.onText(/\/start/, handleStartCommand);

// admin 
bot.onText(/\/admin/, async (msg) => {
  const userId = msg.from.id;

  if (!adminSettings.adminChatIds.includes(userId)) {
    await bot.sendMessage(msg.chat.id, '❌ У вас нет прав администратора.');
    return;
  }

  const totalApplications = applications.size;
  const companyApps = Array.from(applications.values()).filter(app => app.type === 'company').length;
  const participantApps = Array.from(applications.values()).filter(app => app.type === 'participant').length;

  const last24h = Array.from(applications.values()).filter(app =>
    new Date() - new Date(app.submittedAt) < 24 * 60 * 60 * 1000
  ).length;

  const statsText = `
📊 <b>Статистика заявок</b>

📁 Всего заявок: ${totalApplications}
🏢 Заявок от компаний: ${companyApps}
🎓 Заявок от участников: ${participantApps}
⏰ За последние 24 часа: ${last24h}

<b>Последние 10 заявок:</b>
${Array.from(applications.values())
      .slice(-10)
      .map(app => `• ${app.type === 'company' ? '🏢' : '🎓'} ${app.data.companyName || app.data.fio || 'Без названия'} (${app.id})`)
      .join('\n')}
  `;

  await bot.sendMessage(msg.chat.id, statsText, { parse_mode: 'HTML' });
});

// Helper function to format resume link
function formatResumeLink(link) {
  if (!link) return 'Не указано';

  // Make sure link has protocol
  if (!link.startsWith('http://') && !link.startsWith('https://')) {
    link = 'https://' + link;
  }

  return link;
}

bot.on('message', async (msg) => {
  if (msg.web_app_data) {
    console.log('🎯 WEB APP DATA DETECTED!');

    const chatId = msg.chat.id;
    const userId = msg.from.id;
    const data = msg.web_app_data.data;

    try {
      const formData = JSON.parse(data);
      console.log('✅ JSON parsed successfully');

      const applicationId = `TH-${userId}-${Date.now()}`;
      const applicationType = formData.applicationType || 'unknown';

      const application = {
        id: applicationId,
        userId: userId,
        type: applicationType,
        submittedAt: new Date().toISOString(),
        data: formData
      };

      applications.set(applicationId, application);

      let confirmationText;

      if (applicationType === 'company') {
        confirmationText = `
🎉 Заявка компании успешно отправлена!

📋 Номер заявки: <code>${applicationId}</code>

Спасибо за участие в программе Технохантер! Наши специалисты рассмотрят вашу заявку и свяжутся с вами в ближайшее время.

Информация о следующих этапах будет направлена на указанный вами email: <code>${formData.mentorEmail || 'не указан'}</code>
        `;
      } else if (applicationType === 'participant') {
        confirmationText = `
🎓 Заявка участника успешно отправлена!

📋 Номер заявки: <code>${applicationId}</code>

Спасибо за интерес к программе Технохантер! Мы рассмотрим вашу заявку и свяжемся с вами для обсуждения подходящих вакансий.

Ожидайте ответ на email: <code>${formData.email || 'не указан'}</code>

Вы можете ознакомиться с компаниями-партнерами по ссылке:
https://i.moscow/lomonosov_resident
        `;
      }

      await bot.sendMessage(chatId, confirmationText + '\n\nДля подачи новой заявки используйте команду /start', {
        parse_mode: 'HTML'
      });

      if (adminSettings.notificationsEnabled) {
        await sendFullApplicationToAdmins(application);
      }

    } catch (error) {
      console.error('❌ Error processing application:', error);
      await bot.sendMessage(chatId,
        'Произошла ошибка при обработке заявки. Пожалуйста, попробуйте еще раз или обратитесь в поддержку.');
    }
  }
});

async function sendFullApplicationToAdmins(application) {
  const emoji = application.type === 'company' ? '🏢' : '🎓';
  const type = application.type === 'company' ? 'Компания' : 'Участник';

  let fullApplicationText = `
🆕 <b>НОВАЯ ЗАЯВКА ${type.toUpperCase()}</b>

${emoji} <b>Тип:</b> ${type}
🆔 <b>ID:</b> <code>${application.id}</code>
⏰ <b>Время:</b> ${new Date(application.submittedAt).toLocaleString('ru-RU')}

`;

  if (application.type === 'company') {
    fullApplicationText += `
<b>- ИНФОРМАЦИЯ О КОМПАНИИ</b>
🏢 <b>Название:</b> ${application.data.companyName}
📊 <b>ИНН:</b> ${application.data.inn}
🟢 <b>Готовность:</b> ${application.data.readiness}

<b>- КОНТАКТЫ МЕНТОРА</b>
👤 <b>ФИО и должность:</b> ${application.data.mentorName}
📧 <b>Email:</b> ${application.data.mentorEmail}
📱 <b>Телефон:</b> ${application.data.mentorPhone}
💬 <b>Telegram:</b> ${application.data.mentorTelegram}

<b>- ДЕТАЛИ СТАЖИРОВКИ</b>
🏛️ <b>Подразделение:</b> ${application.data.department}
👥 <b>Количество участников:</b> ${application.data.participantsCount}
🔧 <b>Ресурсы:</b> ${application.data.resources || 'Не указано'}
🎯 <b>Краткосрочные цели:</b> ${application.data.shortTermGoals || 'Не указано'}

<b>- ТРЕБОВАНИЯ И УСЛОВИЯ</b>
💼 <b>Навыки:</b> ${application.data.skillRequirements || 'Не указано'}
📋 <b>Другие требования:</b> ${application.data.otherRequirements || 'Не указано'}
🏠 <b>Режим работы:</b> ${application.data.workMode}
⏱️ <b>График:</b> ${application.data.workSchedule}
💰 <b>Оплата:</b> ${application.data.paymentAbility}
🚀 <b>Трудоустройство:</b> ${application.data.employmentProspects || 'Не указано'}
💭 <b>Прочие пожелания:</b> ${application.data.otherWishes || 'Нет'}
`;
  } else if (application.type === 'participant') {
    fullApplicationText += `
<b>- ЛИЧНАЯ ИНФОРМАЦИЯ</b>
👤 <b>ФИО:</b> ${application.data.fio}
🎂 <b>Возраст:</b> ${application.data.age}
🏠 <b>Проживает в Москве:</b> ${application.data.livesInMoscow === true ? 'Да' : application.data.livesInMoscow === false ? 'Нет' : 'Не указано'}

<b>- КОНТАКТЫ</b>
📧 <b>Email:</b> ${application.data.email}
📱 <b>Телефон:</b> ${application.data.phone}
💬 <b>Telegram:</b> ${application.data.telegram}
📄 <b>Резюме:</b> ${formatResumeLink(application.data.resumeLink)}

<b>- ОБРАЗОВАНИЕ</b>
🎓 <b>ВУЗ:</b> ${application.data.university}
📚 <b>Направление:</b> ${application.data.direction}
🎯 <b>Уровень:</b> ${application.data.educationLevel}
📖 <b>Статус:</b> ${application.data.status}
${application.data.course ? `📋 <b>Курс:</b> ${application.data.course}` : ''}

<b>- ПРЕДПОЧТЕНИЯ ПО РАБОТЕ</b>
🏠 <b>Режим работы:</b> ${application.data.workMode}
⏱️ <b>График:</b> ${application.data.workSchedule}
${application.data.customHours ? `⏰ <b>Часов в неделю:</b> ${application.data.customHours}` : ''}
💰 <b>Оплата:</b> ${application.data.paymentPossibility}
`;
  }

  fullApplicationText += `
<b>══════════════</b>
#новая_заявка #${application.type}
  `;

  for (const adminChatId of adminSettings.adminChatIds) {
    try {
      await bot.sendMessage(adminChatId, fullApplicationText, {
        parse_mode: 'HTML'
      });

      console.log(`✅ Full application sent to admin ${adminChatId}`);
    } catch (error) {
      console.error(`❌ Failed to notify admin ${adminChatId}:`, error.message);
    }
  }
}

bot.onText(/\/help/, async (msg) => {
  const helpText = `
🤖 <b>Помощь по боту Технохантер</b>

<b>Доступные команды:</b>
/start - Открыть форму заявки
/help - Показать эту справку
/status - Проверить статус бота

<b>Что делает этот бот:</b>
• Помогает компаниям подавать заявки на участие в программе
• Позволяет студентам регистрироваться как участники

<b>Контакты поддержки:</b>
По всем вопросам обращайтесь к менеджеру: @astafeva_alisiia
  `;

  await bot.sendMessage(msg.chat.id, helpText, {
    parse_mode: 'HTML'
  });
});

bot.onText(/\/status/, async (msg) => {
  const statusText = `
✅ <b>Статус бота: Активен</b>

🕐 Время сервера: ${new Date().toLocaleString('ru-RU')}
📊 Всего заявок: ${applications.size}
🌐 Web App URL: ${process.env.WEBAPP_URL ? '✅ Настроен' : '❌ Не настроен'}
  `;

  await bot.sendMessage(msg.chat.id, statusText, {
    parse_mode: 'HTML'
  });
});

bot.on('polling_error', (error) => {
  console.error('❌ Polling error:', error);
});

bot.on('error', (error) => {
  console.error('❌ Bot error:', error);
});

process.on('SIGINT', () => {
  console.log('\n🛑 Received SIGINT. Shutting down gracefully...');
  bot.stopPolling();
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.log('\n🛑 Received SIGTERM. Shutting down gracefully...');
  bot.stopPolling();
  process.exit(0);
});

app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    totalApplications: applications.size
  });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Health check server running on port ${PORT}`);
});

console.log('🤖 Bot starting...');
console.log(`🔑 Bot token: ${process.env.BOT_TOKEN ? '✅ Configured' : '❌ Missing'}`);
console.log(`🌐 Web App URL: ${process.env.WEBAPP_URL || '❌ Not configured'}`);

bot.deleteWebHook().then(() => {
  console.log('✅ Webhooks cleared, using polling mode');
  console.log('✅ Bot is ready and listening for messages');
}).catch(err => {
  console.error('❌ Error clearing webhooks:', err);
});