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

//Admin
bot.onText(/\/admin/, async (msg) => {
  const userId = msg.from.id;

  if (!adminSettings.adminChatIds.includes(userId)) {
    await bot.sendMessage(msg.chat.id, '❌ У вас нет прав администратора.');
    return;
  }

  const adminKeyboard = {
    inline_keyboard: [
      [
        { text: '📊 Статистика заявок', callback_data: 'admin_stats' },
        { text: '📋 Список заявок', callback_data: 'admin_list' }
      ],
      [
        {
          text: '🔔 Уведомления: ' + (adminSettings.notificationsEnabled ? 'ВКЛ' : 'ВЫКЛ'),
          callback_data: 'admin_toggle_notifications'
        }
      ],
      [
        { text: '📥 Экспорт в CSV', callback_data: 'admin_export' }
      ]
    ]
  };

  await bot.sendMessage(msg.chat.id, '🔧 Панель администратора:', {
    reply_markup: adminKeyboard
  });
});

// admin callbacks
bot.on('callback_query', async (query) => {
  const chatId = query.message.chat.id;
  const userId = query.from.id;
  const data = query.data;

  await bot.answerCallbackQuery(query.id);

  if (data.startsWith('admin_')) {
    if (!adminSettings.adminChatIds.includes(userId)) {
      await bot.sendMessage(chatId, '❌ У вас нет прав администратора.');
      return;
    }

    if (data === 'admin_stats') {
      await handleAdminStats(chatId);
    } else if (data === 'admin_list') {
      await handleAdminList(chatId, query.message.message_id);
    } else if (data === 'admin_toggle_notifications') {
      adminSettings.notificationsEnabled = !adminSettings.notificationsEnabled;
      await bot.sendMessage(chatId,
        `🔔 Уведомления ${adminSettings.notificationsEnabled ? 'включены' : 'выключены'}`
      );
    } else if (data === 'admin_export') {
      await handleAdminExport(chatId);
    }
  } else if (data.startsWith('view_app_')) {
    await handleViewApplication(chatId, data.replace('view_app_', ''));
  }
});

async function handleAdminStats(chatId) {
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
  `;

  await bot.sendMessage(chatId, statsText, { parse_mode: 'HTML' });
}

async function handleAdminList(chatId, messageId) {
  const appList = Array.from(applications.values()).slice(-20); // Last 10 applications

  if (appList.length === 0) {
    await bot.sendMessage(chatId, '📭 Пока нет заявок.');
    return;
  }

  const listText = '📋 <b>Последние заявки:</b>\n\n' +
    appList.map(app =>
      `${app.type === 'company' ? '🏢' : '🎓'} ${app.data.companyName || app.data.fio || 'Без названия'}\n` +
      `ID: <code>${app.id}</code>\n` +
      `📅 ${new Date(app.submittedAt).toLocaleString('ru-RU')}`
    ).join('\n\n');

  const keyboard = {
    inline_keyboard: appList.map(app => [{
      text: `👁 ${app.id}`,
      callback_data: `view_app_${app.id}`
    }])
  };

  await bot.sendMessage(chatId, listText, {
    parse_mode: 'HTML',
    reply_markup: keyboard
  });
}

async function handleViewApplication(chatId, appId) {
  const app = applications.get(appId);
  if (!app) {
    await bot.sendMessage(chatId, '❌ Заявка не найдена.');
    return;
  }

  let detailsText = `
📄 <b>Детали заявки</b>
🆔 ID: <code>${app.id}</code>
📅 Дата: ${new Date(app.submittedAt).toLocaleString('ru-RU')}

`;

  if (app.type === 'company') {
    detailsText += `
🏢 <b>Компания:</b> ${app.data.companyName}
📊 ИНН: ${app.data.inn}
👤 Ментор: ${app.data.mentorName}
📧 Email: ${app.data.mentorEmail}
📱 Телефон: ${app.data.mentorPhone}
💬 Telegram: ${app.data.mentorTelegram}

<b>Готовность:</b> ${app.data.readiness}
<b>Подразделение:</b> ${app.data.department}
<b>Количество участников:</b> ${app.data.participantsCount}
<b>Режим работы:</b> ${app.data.workMode}
<b>График:</b> ${app.data.workSchedule}
<b>Оплата:</b> ${app.data.paymentAbility}
`;
  } else {
    detailsText += `
🎓 <b>Участник:</b> ${app.data.fio}
🎂 Возраст: ${app.data.age}
📧 Email: ${app.data.email}
📱 Телефон: ${app.data.phone}
💬 Telegram: ${app.data.telegram}

<b>ВУЗ:</b> ${app.data.university}
<b>Направление:</b> ${app.data.direction}
<b>Уровень:</b> ${app.data.educationLevel}
<b>Статус:</b> ${app.data.status}
<b>Курс:</b> ${app.data.course || 'Не указан'}

<b>Режим работы:</b> ${app.data.workMode}
<b>График:</b> ${app.data.workSchedule}
<b>Оплата:</b> ${app.data.paymentPossibility}
`;
  }

  await bot.sendMessage(chatId, detailsText, { parse_mode: 'HTML' });
}

async function handleAdminExport(chatId) {
  if (applications.size === 0) {
    await bot.sendMessage(chatId, '📭 Нет данных для экспорта.');
    return;
  }

  let csvContent = 'ID,Type,Name,Email,Phone,Submitted\n';

  applications.forEach((app) => {
    const name = app.type === 'company' ? app.data.companyName : app.data.fio;
    const email = app.type === 'company' ? app.data.mentorEmail : app.data.email;
    const phone = app.type === 'company' ? app.data.mentorPhone : app.data.phone;

    csvContent += `"${app.id}","${app.type}","${name}","${email}","${phone}","${app.submittedAt}"\n`;
  });

  // In a real implementation, you would save this to a file and send it
  // TODO
  await bot.sendMessage(chatId,
    '📥 Экспорт готов. В реальной версии здесь будет файл CSV с данными всех заявок.'
  );
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
        await notifyAdministrators(application);
      }

    } catch (error) {
      console.error('❌ Error processing application:', error);
      await bot.sendMessage(chatId,
        'Произошла ошибка при обработке заявки. Пожалуйста, попробуйте еще раз или обратитесь в поддержку.');
    }
  }
});

async function notifyAdministrators(application) {
  const emoji = application.type === 'company' ? '🏢' : '🎓';
  const name = application.type === 'company'
    ? application.data.companyName
    : application.data.fio;

  const adminNotification = `
🆕 Новая заявка!

${emoji} Тип: ${application.type === 'company' ? 'Компания' : 'Участник'}
📝 Имя: ${name || 'Не указано'}
🆔 ID: <code>${application.id}</code>
⏰ Время: ${new Date(application.submittedAt).toLocaleString('ru-RU')}

Используйте /admin для просмотра деталей.

#новая_заявка #${application.type}
  `;

  for (const adminChatId of adminSettings.adminChatIds) {
    try {
      await bot.sendMessage(adminChatId, adminNotification, {
        parse_mode: 'HTML'
      });
    } catch (error) {
      console.error(`Failed to notify admin ${adminChatId}:`, error.message);
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