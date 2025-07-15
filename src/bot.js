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

const userSessions = new Map();

bot.onText(/\/start/, async (msg) => {
  const chatId = msg.chat.id;
  const userId = msg.from.id;
  const userName = msg.from.first_name || 'Пользователь';

  console.log(`📱 New user started bot: ${userName} (ID: ${userId})`);

  userSessions.set(userId, {
    startTime: new Date(),
    currentStep: 'choosing_type',
    chatId: chatId
  });


  const welcomeText = `
🚀 Добро пожаловать в Технохантер, ${userName}!

Технохантер — это эффективный механизм ранней профессиональной интеграции студентов и аспирантов ведущих российских вузов в R&D-процессы технологичных компаний Москвы.

Выберите, кто вы:
  `;


  const keyboard = {
    inline_keyboard: [
      [
        {
          text: '🏢 Компания',
          callback_data: 'user_type_company'
        }
      ],
      [
        {
          text: '🎓 Участник программы',
          callback_data: 'user_type_participant'
        }
      ]
    ]
  };

  console.log('📋 Created keyboard:', JSON.stringify(keyboard, null, 2));

  try {
    await bot.sendMessage(chatId, welcomeText, {
      reply_markup: keyboard,
      parse_mode: 'HTML'
    });
    console.log('✅ Welcome message sent successfully');
  } catch (error) {
    console.error('❌ Error sending welcome message:', error);
    await bot.sendMessage(chatId, 'Произошла ошибка. Попробуйте команду /start еще раз.');
  }
});


bot.on('callback_query', async (query) => {
  const chatId = query.message.chat.id;
  const userId = query.from.id;
  const data = query.data;

  console.log(`📞 Callback query received: ${data} from user ${userId}`);

  await bot.answerCallbackQuery(query.id);

  try {
    if (data === 'user_type_company') {
      console.log('✅ Processing company selection');
      await handleCompanySelection(chatId, userId, query.message.message_id);
    } else if (data === 'user_type_participant') {
      console.log('✅ Processing participant selection');
      await handleParticipantSelection(chatId, userId, query.message.message_id);
    } else if (data === 'back_to_start') {
      console.log('✅ Processing back to start');

      const fakeStartMessage = {
        chat: { id: query.message.chat.id },
        from: query.from,
        text: '/start'
      };

      try {
        await bot.deleteMessage(query.message.chat.id, query.message.message_id);
      } catch (error) {
        console.warn('Could not delete message:', error.message);
      }

      bot.emit('text', fakeStartMessage);
    } else {
      console.warn(`⚠️ Unknown callback data: ${data}`);
    }
  } catch (error) {
    console.error('❌ Error handling callback query:', error);
    await bot.sendMessage(chatId, 'Произошла ошибка. Попробуйте команду /start еще раз.');
  }
});

async function handleCompanySelection(chatId, userId, messageId) {
  console.log(`🏢 User ${userId} selected company registration`);

  const session = userSessions.get(userId);
  if (session) {
    session.userType = 'company';
    session.currentStep = 'company_registration';
  }

  const updatedText = `
✅ Вы выбрали: Компания

Сейчас откроется форма для регистрации заявки компании. Заполнение займет около 5-10 минут.

Нажмите кнопку ниже, чтобы начать:
  `;

  const webAppKeyboard = {
    inline_keyboard: [
      [
        {
          text: '📋 Заполнить заявку компании',
          web_app: {
            url: process.env.WEBAPP_URL
          }
        }
      ],
      [
        {
          text: '◀️ Назад к выбору',
          callback_data: 'back_to_start'
        }
      ]
    ]
  };

  try {
    await bot.editMessageText(updatedText, {
      chat_id: chatId,
      message_id: messageId,
      reply_markup: webAppKeyboard,
      parse_mode: 'HTML'
    });
  } catch (error) {
    console.warn('Could not edit message, sending new one:', error.message);
    await bot.sendMessage(chatId, updatedText, {
      reply_markup: webAppKeyboard,
      parse_mode: 'HTML'
    });
  }
}

// TODO
async function handleParticipantSelection(chatId, userId, messageId) {
  console.log(`🎓 User ${userId} selected participant registration`);

  const session = userSessions.get(userId);
  if (session) {
    session.userType = 'participant';
    session.currentStep = 'participant_not_ready';
  }

  const notReadyText = `
🎓 Вы выбрали: Участник программы

К сожалению, форма для участников программы пока находится в разработке. 🔧

Пожалуйста, обратитесь позже или свяжитесь с организаторами программы напрямую.
  `;

  const backKeyboard = {
    inline_keyboard: [
      [
        {
          text: '◀️ Назад к выбору',
          callback_data: 'back_to_start'
        }
      ]
    ]
  };

  try {
    await bot.editMessageText(notReadyText, {
      chat_id: chatId,
      message_id: messageId,
      reply_markup: backKeyboard,
      parse_mode: 'HTML'
    });
  } catch (error) {
    console.warn('Could not edit message, sending new one:', error.message);
    await bot.sendMessage(chatId, notReadyText, {
      reply_markup: backKeyboard,
      parse_mode: 'HTML'
    });
  }
}

/*
bot.on('callback_query', async (query) => {
  if (query.data === 'back_to_start') {
    await bot.answerCallbackQuery(query.id);

    const fakeStartMessage = {
      chat: { id: query.message.chat.id },
      from: query.from,
      text: '/start'
    };

    try {
      await bot.deleteMessage(query.message.chat.id, query.message.message_id);
    } catch (error) {
      console.warn('Could not delete message:', error.message);
    }

    bot.emit('text', fakeStartMessage);
  }
});*/

bot.on('web_app_data', async (msg) => {
  console.log('🎯 RAW MESSAGE RECEIVED:', JSON.stringify(msg, null, 2));

  const chatId = msg.chat.id;
  const userId = msg.from.id;
  const data = msg.web_app.data;

  console.log(`📊 Received Web App data from user ${userId}`);
  console.log(`💬 Chat ID: ${chatId}`);
  console.log(`📱 Data length: ${data.length} characters`);
  console.log(`📋 Raw data: ${data.substring(0, 100)}...`);
  try {
    const formData = JSON.parse(data);
    console.log('✅ JSON parsed successfully');
    console.log('🏢 Company name:', formData.companyName);

    const applicationId = `TH-${userId}-${Date.now()}`;

    const application = {
      id: applicationId,
      userId: userId,
      submittedAt: new Date().toISOString(),
      data: formData
    };

    console.log('📋 New company application:', JSON.stringify(application, null, 2));

    const confirmationText = `
🎉 Заявка успешно отправлена!

📋 Номер заявки: <code>${applicationId}</code>

Спасибо за участие в программе Технохантер! Наши специалисты рассмотрят вашу заявку и свяжутся с вами в ближайшее время.

Информация о следующих этапах будет направлена на указанный вами email: <code>${formData.mentorEmail || 'не указан'}</code>

Для подачи новой заявки используйте команду /start
    `;

    await bot.sendMessage(chatId, confirmationText, {
      parse_mode: 'HTML'
    });

    userSessions.delete(userId);

    await notifyAdministrators(application);

  } catch (error) {
    console.error('❌ JSON parse error:', error);
    console.error('📋 Problematic data:', data);
    await bot.sendMessage(chatId,
      'Произошла ошибка при обработке заявки. Пожалуйста, попробуйте еще раз или обратитесь в поддержку.');
  }
});
bot.on('message', (msg) => {
  console.log('📨 ANY MESSAGE:', {
    type: msg.chat.type,
    from: msg.from.first_name,
    text: msg.text?.substring(0, 50),
    hasWebAppData: !!msg.web_app
  });
});

async function notifyAdministrators(application) {
  const adminChatIds = [
    848907805,
  ];

  const adminNotification = `
🆕 Новая заявка от компании!

🏢 Компания: ${application.data.companyName || 'Не указана'}
🆔 ID заявки: <code>${application.id}</code>
👤 Ментор: ${application.data.mentorName || 'Не указан'}
📧 Email: ${application.data.mentorEmail || 'Не указан'}
⏰ Время подачи: ${new Date(application.submittedAt).toLocaleString('ru-RU')}

#новая_заявка #компания
  `;

  for (const adminChatId of adminChatIds) {
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
/start - Начать регистрацию заявки
/help - Показать эту справку
/status - Проверить статус бота

<b>Что делает этот бот:</b>
• Помогает компаниям подавать заявки на участие в программе Технохантер
• Предоставляет удобную форму для заполнения всех необходимых данных
• Автоматически уведомляет организаторов о новых заявках

<b>Нужна помощь?</b>
Обратитесь к организаторам программы или воспользуйтесь командой /start для начала работы.
  `;

  await bot.sendMessage(msg.chat.id, helpText, {
    parse_mode: 'HTML'
  });
});

bot.onText(/\/status/, async (msg) => {
  const statusText = `
✅ <b>Статус бота: Активен</b>

🕐 Время сервера: ${new Date().toLocaleString('ru-RU')}
👥 Активных сессий: ${userSessions.size}
🌐 Web App URL: ${process.env.WEBAPP_URL ? '✅ Настроен' : '❌ Не настроен'}

Бот работает нормально!
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
    activeSessions: userSessions.size
  });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Health check server running on port ${PORT}`);
});

console.log('🤖 Bot starting...');
console.log(`🔑 Bot token: ${process.env.BOT_TOKEN ? '✅ Configured' : '❌ Missing'}`);
console.log(`🌐 Web App URL: ${process.env.WEBAPP_URL || '❌ Not configured'}`);
console.log('✅ Bot is ready and listening for messages');