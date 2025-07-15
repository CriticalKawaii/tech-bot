import React, { useState, useEffect } from 'react';
import { Check, Building, User, ArrowRight, ArrowLeft, Component } from 'lucide-react'

const App = () => {
  const [currentStep, setCurrentStep] = useState(0);
  const [userType, setUserType] = useState('');
  const [formData, setFormData] = useState({
    readiness: '',
    companyName: '',
    inn: '',
    mentorName: '',
    mentorEmail: '',
    mentorPhone: '',
    mentorTelegram: '',
    department: '',
    participantsCount: '',
    resources: '',
    shortTermGoals: '',
    skillRequirements: '',
    otherRequirements: '',
    workMode: '',
    workSchedule: '',
    employmentProspects: '',
    paymentAbility: '',
    otherWishes: ''
  });

  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (window.Telegram?.WebApp) {
      const tg = window.Telegram?.WebApp;
      tg.ready();
      tg.expand();

      tg.MainButton.setText('Продолжить');
      tg.MainButton.onClick(() => handleNext());
    }
  }, []);

  const updateTelegramButton = (text, show = true) => {
    if (window.Telegram?.WebApp) {
      const tg = window.Telegram.WebApp;
      tg.MainButton.setText(text);
      if (show) {
        tg.MainButton.show();
      } else {
        tg.MainButton.hide();
      }
    }
  };

  const validateEmail = (email) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  const validateINN = (inn) => {
    return /^\d{10}$|^\d{12}$/.test(inn);
  };

  const validatePhone = (phone) => {
    const cleanPhone = phone.replace(/[^\d+]/g, '');
    return cleanPhone.length >= 10;
  };

  const handleNext = () => {
    const stepErrors = validateCurrentStep();

    if (Object.keys(stepErrors).length > 0) {
      setErrors(stepErrors);
      return;
    }

    setErrors({});

    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      handleSubmit();
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const validateCurrentStep = () => {
    const newErrors = {};
    const step = steps[currentStep];

    if (!step) return newErrors;

    step.fields?.forEach(field => {
      const value = formData[field.key];

      if (field.required && (!value || value.trim() === '')) {
        newErrors[field.key] = 'Это поле обязательно для заполнения';
      } else if (value) {
        if (field.key === 'mentorEmail' && !validateEmail(value)) {
          newErrors[field.key] = 'Введите корректный email адрес';
        } else if (field.key === 'inn' && !validateINN(value)) {
          newErrors[field.key] = 'ИНН должен содержать 10 или 12 цифр';
        } else if (field.key === 'mentorPhone' && !validatePhone(value)) {
          newErrors[field.key] = 'Введите корректный номер телефона';
        }
      }
    });

    return newErrors;
  };

  const updateFormData = (key, value) => {
    setFormData(prev => ({
      ...prev,
      [key]: value
    }));

    if (errors[key]) {
      setErrors(prev => ({
        ...prev,
        [key]: undefined
      }));
    }
  };

  const handleSubmit = () => {
    console.log('Submitting form data:', formData);

    if (window.Telegram?.WebApp) {
      const tg = window.Telegram.WebApp;
      tg.sendData(JSON.stringify(formData));
      tg.close();
    }

    alert('Заявка успешно отправлена!');
  };

  const steps = [
    {
      title: 'Выбор типа пользователя',
      component: UserTypeSelection
    },
    {
      title: 'Готовность компании',
      fields: [{ key: 'readiness', required: true }],
      component: ReadinessStep
    },
    {
      title: 'Информация о компании',
      fields: [
        { key: 'companyName', required: true },
        { key: 'inn', required: true }
      ],
      component: CompanyInfoStep
    },
    {
      title: 'Информация о менторе',
      fields: [
        { key: 'mentorName', required: true },
        { key: 'mentorEmail', required: true },
        { key: 'mentorPhone', required: true },
        { key: 'mentorTelegram', required: true }
      ],
      component: MentorInfoStep
    },
    {
      title: 'Детали стажировки',
      fields: [
        { key: 'department', required: true },
        { key: 'participantsCount', required: true },
        { key: 'resources', required: true },
        { key: 'shortTermGoals', required: true }
      ],
      component: InternshipDetailsStep
    },
    {
      title: 'Требования к участникам',
      fields: [
        { key: 'skillRequirements', required: true }
      ],
      component: RequirementsStep
    },
    {
      title: 'Условия работы',
      fields: [
        { key: 'workMode', required: true },
        { key: 'workSchedule', required: true },
        { key: 'employmentProspects', required: true },
        { key: 'paymentAbility', required: true }
      ],
      component: WorkConditionsStep
    },
    {
      title: 'Подтверждение',
      component: ConfirmationStep
    }
  ];

  function UserTypeSelection() {
    return (
      <div className="space-y-6">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-gray-800 mb-2">Добро пожаловать в Технохантер!</h1>
          <p>
            Эффективный механизм ранней профессиональной интеграции студентов и аспирантов
            ведущих российских вузов в R&D-процессы технологичных компаний Москвы
          </p>
        </div>

        <div className="space-y-4">
          <button
            onClick={() => {
              setUserType('company');
              setCurrentStep(1);
            }}
            className="w-full p-4 border-2 border-blue-500 rounded-lg hover:bg-blue-50 transition-colors flex items-center space-x-3"
          >
            <Building className="w-6 h-6 text-blue-500" />
            <div className="text-left">
              <div className="font-semibold text-gray-800">Компания</div>
              <div className="text-sm text-gray-600">Разместить заявку на стажера</div>
            </div>
          </button>

          <button
            onClick={() => alert('Форма для участников находится в разработке')}
            className="w-full p-4 border-2 border-gray-300 rounded-lg hover:bg-gray-50 transition-colors flex items-center space-x-3 opacity-60"
          >
            <User className="w-6 h-6 text-gray-400" />
            <div className="text-left">
              <div className="font-semibold text-gray-600">Участник программы</div>
              <div className="text-sm text-gray-500">В разработке</div>
            </div>
          </button>
        </div>
      </div>
    );
  }

  function ReadinessStep() {
    const options = [
      'Да, готовы уже сейчас',
      'Да, готовы с сентября',
      'Не уверены',
      'Не готовы'
    ];

    return (
      <div className="space-y-4">
        <h2 className="text-xl font-semibold text-gray-800">
          Готовность компании принять участника(-ов) на стажировку
        </h2>

        <div className="space-y-3">
          {options.map((option, index) => (
            <button
              key={index}
              onClick={() => updateFormData('readiness', option)}
              className={`w-full p-3 border rounded-lg text-left transition-colors ${formData.readiness === option
                ? 'border-blue-500 bg-blue-50 text-blue-700'
                : 'border-gray-300 hover:border-gray-400'
                }`}
            >
              {option}
            </button>
          ))}
        </div>

        {errors.readiness && (
          <p className="text-red-500 text-sm">{errors.readiness}</p>
        )}
      </div>
    );
  }

  function CompanyInfoStep() {
    return (
      <div className="space-y-6">
        <h2 className="text-xl font-semibold text-gray-800">Информация о компании</h2>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Наименование компании *
          </label>
          <input
            type="text"
            value={formData.companyName}
            onChange={(e) => updateFormData('companyName', e.target.value)}
            className={`w-full p-3 border rounded-lg ${errors.companyName ? 'border-red-500' : 'border-gray-300'
              }`}
            placeholder="ООО Технологии будущего"
          />
          {errors.companyName && (
            <p className="text-red-500 text-sm mt-1">{errors.companyName}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            ИНН компании *
          </label>
          <input
            type="text"
            value={formData.inn}
            onChange={(e) => updateFormData('inn', e.target.value)}
            className={`w-full p-3 border rounded-lg ${errors.inn ? 'border-red-500' : 'border-gray-300'
              }`}
            placeholder="1234567890"
            maxLength="12"
          />
          {errors.inn && (
            <p className="text-red-500 text-sm mt-1">{errors.inn}</p>
          )}
          <p className="text-gray-500 text-sm mt-1">10 или 12 цифр</p>
        </div>
      </div>
    );
  }

  function MentorInfoStep() {
    return (
      <div className="space-y-6">
        <div>
          <h2 className="text-xl font-semibold text-gray-800">Информация о менторе</h2>
          <p className="text-gray-600 text-sm mt-1">
            Ментором является сотрудник компании, который выступает в роли наставника для участника программы
          </p>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            ФИО и должность ментора *
          </label>
          <input
            type="text"
            value={formData.mentorName}
            onChange={(e) => updateFormData('mentorName', e.target.value)}
            className={`w-full p-3 border rounded-lg ${errors.mentorName ? 'border-red-500' : 'border-gray-300'
              }`}
            placeholder="Иванов Иван Иванович, ведущий разработчик"
          />
          {errors.mentorName && (
            <p className="text-red-500 text-sm mt-1">{errors.mentorName}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Email ментора *
          </label>
          <input
            type="email"
            value={formData.mentorEmail}
            onChange={(e) => updateFormData('mentorEmail', e.target.value)}
            className={`w-full p-3 border rounded-lg ${errors.mentorEmail ? 'border-red-500' : 'border-gray-300'
              }`}
            placeholder="mentor@company.ru"
          />
          {errors.mentorEmail && (
            <p className="text-red-500 text-sm mt-1">{errors.mentorEmail}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Телефон ментора *
          </label>
          <input
            type="tel"
            value={formData.mentorPhone}
            onChange={(e) => updateFormData('mentorPhone', e.target.value)}
            className={`w-full p-3 border rounded-lg ${errors.mentorPhone ? 'border-red-500' : 'border-gray-300'
              }`}
            placeholder="+7 (999) 123-45-67"
          />
          {errors.mentorPhone && (
            <p className="text-red-500 text-sm mt-1">{errors.mentorPhone}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Telegram ментора *
          </label>
          <input
            type="text"
            value={formData.mentorTelegram}
            onChange={(e) => updateFormData('mentorTelegram', e.target.value)}
            className={`w-full p-3 border rounded-lg ${errors.mentorTelegram ? 'border-red-500' : 'border-gray-300'
              }`}
            placeholder="@username или t.me/username"
          />
          {errors.mentorTelegram && (
            <p className="text-red-500 text-sm mt-1">{errors.mentorTelegram}</p>
          )}
        </div>
      </div>
    );
  }

  function InternshipDetailsStep() {
    return (
      <div className="space-y-6">
        <h2 className="text-xl font-semibold text-gray-800">Детали стажировки</h2>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Структурное подразделение компании *
          </label>
          <textarea
            value={formData.department}
            onChange={(e) => updateFormData('department', e.target.value)}
            className={`w-full p-3 border rounded-lg ${errors.department ? 'border-red-500' : 'border-gray-300'
              }`}
            rows="3"
            placeholder="Отдел разработки / команда AI-проектов"
          />
          {errors.department && (
            <p className="text-red-500 text-sm mt-1">{errors.department}</p>
          )}
          <p className="text-gray-500 text-sm mt-1">
            Если официального подразделения нет, опишите профильный блок команды
          </p>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Количество привлекаемых участников *
          </label>
          <input
            type="text"
            value={formData.participantsCount}
            onChange={(e) => updateFormData('participantsCount', e.target.value)}
            className={`w-full p-3 border rounded-lg ${errors.participantsCount ? 'border-red-500' : 'border-gray-300'
              }`}
            placeholder="2-3 человека или 5"
          />
          {errors.participantsCount && (
            <p className="text-red-500 text-sm mt-1">{errors.participantsCount}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Предоставляемые ресурсы *
          </label>
          <textarea
            value={formData.resources}
            onChange={(e) => updateFormData('resources', e.target.value)}
            className={`w-full p-3 border rounded-lg ${errors.resources ? 'border-red-500' : 'border-gray-300'
              }`}
            rows="4"
            placeholder="Рабочее место, ноутбук MacBook Pro, доступ к облачным сервисам, библиотека, опытные наставники..."
          />
          {errors.resources && (
            <p className="text-red-500 text-sm mt-1">{errors.resources}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Краткосрочные цели компании *
          </label>
          <textarea
            value={formData.shortTermGoals}
            onChange={(e) => updateFormData('shortTermGoals', e.target.value)}
            className={`w-full p-3 border rounded-lg ${errors.shortTermGoals ? 'border-red-500' : 'border-gray-300'
              }`}
            rows="4"
            placeholder="Разработка нового продукта, исследование в области машинного обучения, оптимизация существующих процессов..."
          />
          {errors.shortTermGoals && (
            <p className="text-red-500 text-sm mt-1">{errors.shortTermGoals}</p>
          )}
          <p className="text-gray-500 text-sm mt-1">
            Цели до конца года, в достижении которых будет задействован участник
          </p>
        </div>
      </div>
    );
  }

  function RequirementsStep() {
    return (
      <div className="space-y-6">
        <h2 className="text-xl font-semibold text-gray-800">Требования к участникам</h2>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Требования к профильным навыкам и компетенциям *
          </label>
          <textarea
            value={formData.skillRequirements}
            onChange={(e) => updateFormData('skillRequirements', e.target.value)}
            className={`w-full p-3 border rounded-lg ${errors.skillRequirements ? 'border-red-500' : 'border-gray-300'
              }`}
            rows="4"
            placeholder="Python, машинное обучение, опыт с TensorFlow, знание алгоритмов..."
          />
          {errors.skillRequirements && (
            <p className="text-red-500 text-sm mt-1">{errors.skillRequirements}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Другие требования к участникам
          </label>
          <textarea
            value={formData.otherRequirements}
            onChange={(e) => updateFormData('otherRequirements', e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-lg"
            rows="3"
            placeholder="Возраст 20-25 лет, опыт участия в хакатонах, английский язык..."
          />
          <p className="text-gray-500 text-sm mt-1">Необязательное поле</p>
        </div>
      </div>
    );
  }

  function WorkConditionsStep() {
    const workModes = ['Онлайн', 'Офлайн', 'Гибрид'];
    const schedules = ['20 часов в неделю', '40 часов в неделю', 'Ненормированный рабочий график'];
    const employment = ['Да', 'Нет', 'Обсуждается в индивидуальном порядке'];
    const payments = [
      'Да, до 20 тысяч рублей в месяц',
      'Да, от 20 до 50 тысяч рублей в месяц',
      'Да, от 50 до 100 тысяч рублей в месяц',
      'Да, более 100 тысяч рублей в месяц',
      'Только в исключительных случаях',
      'Нет'
    ];

    return (
      <div className="space-y-6">
        <h2 className="text-xl font-semibold text-gray-800">Условия работы</h2>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">
            Режим работы *
          </label>
          <div className="space-y-2">
            {workModes.map((mode, index) => (
              <button
                key={index}
                onClick={() => updateFormData('workMode', mode)}
                className={`w-full p-3 border rounded-lg text-left transition-colors ${formData.workMode === mode
                  ? 'border-blue-500 bg-blue-50 text-blue-700'
                  : 'border-gray-300 hover:border-gray-400'
                  }`}
              >
                {mode}
              </button>
            ))}
          </div>
          {errors.workMode && (
            <p className="text-red-500 text-sm mt-1">{errors.workMode}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">
            График работы *
          </label>
          <div className="space-y-2">
            {schedules.map((schedule, index) => (
              <button
                key={index}
                onClick={() => updateFormData('workSchedule', schedule)}
                className={`w-full p-3 border rounded-lg text-left transition-colors ${formData.workSchedule === schedule
                  ? 'border-blue-500 bg-blue-50 text-blue-700'
                  : 'border-gray-300 hover:border-gray-400'
                  }`}
              >
                {schedule}
              </button>
            ))}
          </div>
          {errors.workSchedule && (
            <p className="text-red-500 text-sm mt-1">{errors.workSchedule}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">
            Перспектива трудоустройства *
          </label>
          <div className="space-y-2">
            {employment.map((option, index) => (
              <button
                key={index}
                onClick={() => updateFormData('employmentProspects', option)}
                className={`w-full p-3 border rounded-lg text-left transition-colors ${formData.employmentProspects === option
                  ? 'border-blue-500 bg-blue-50 text-blue-700'
                  : 'border-gray-300 hover:border-gray-400'
                  }`}
              >
                {option}
              </button>
            ))}
          </div>
          {errors.employmentProspects && (
            <p className="text-red-500 text-sm mt-1">{errors.employmentProspects}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">
            Возможность оплаты *
          </label>
          <div className="space-y-2">
            {payments.map((payment, index) => (
              <button
                key={index}
                onClick={() => updateFormData('paymentAbility', payment)}
                className={`w-full p-3 border rounded-lg text-left transition-colors ${formData.paymentAbility === payment
                  ? 'border-blue-500 bg-blue-50 text-blue-700'
                  : 'border-gray-300 hover:border-gray-400'
                  }`}
              >
                {payment}
              </button>
            ))}
          </div>
          {errors.paymentAbility && (
            <p className="text-red-500 text-sm mt-1">{errors.paymentAbility}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Прочие пожелания
          </label>
          <textarea
            value={formData.otherWishes}
            onChange={(e) => updateFormData('otherWishes', e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-lg"
            rows="3"
            placeholder="Дополнительные комментарии или пожелания..."
          />
          <p className="text-gray-500 text-sm mt-1">Необязательное поле</p>
        </div>
      </div>
    );
  }

  function ConfirmationStep() {
    return (
      <div className="space-y-6">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-800 mb-2">Подтверждение заявки</h2>
          <p className="text-gray-600">Проверьте введенную информацию перед отправкой</p>
        </div>

        <div className="bg-gray-50 rounded-lg p-6 space-y-4">
          <div className="grid grid-cols-1 gap-4 text-sm">
            <div><strong>Компания:</strong> {formData.companyName}</div>
            <div><strong>ИНН:</strong> {formData.inn}</div>
            <div><strong>Ментор:</strong> {formData.mentorName}</div>
            <div><strong>Email:</strong> {formData.mentorEmail}</div>
            <div><strong>Телефон:</strong> {formData.mentorPhone}</div>
            <div><strong>Telegram:</strong> {formData.mentorTelegram}</div>
            <div><strong>Готовность:</strong> {formData.readiness}</div>
            <div><strong>Режим работы:</strong> {formData.workMode}</div>
            <div><strong>График:</strong> {formData.workSchedule}</div>
            <div><strong>Трудоустройство:</strong> {formData.employmentProspects}</div>
            <div><strong>Оплата:</strong> {formData.paymentAbility}</div>
          </div>
        </div>

        <div className="text-center">
          <button
            onClick={handleSubmit}
            className="bg-blue-500 text-white px-8 py-3 rounded-lg hover:bg-blue-600 transition-colors font-semibold"
          >
            Отправить заявку
          </button>
        </div>
      </div>
    );
  }

  const progress = userType ? ((currentStep) / (steps.length - 1)) * 100 : 0;

  return (
    <div className="min-h-screen bg-white">
      {/* Progress bar - shows how much of the form is completed */}
      {userType && (
        <div className="w-full bg-gray-200 h-1">
          <div
            className="bg-blue-500 h-1 transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
      )}

      <div className="max-w-md mx-auto p-6">
        {/* Navigation buttons */}
        {userType && currentStep > 1 && (
          <button
            onClick={handleBack}
            className="mb-6 flex items-center space-x-2 text-blue-500 hover:text-blue-600"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Назад</span>
          </button>
        )}

        {/* Current step content */}
        {steps[currentStep] && React.createElement(steps[currentStep].component)}

        {/* Next button (for non-Telegram environments) */}
        {userType && !window.Telegram?.WebApp && (
          <div className="mt-8 flex space-x-4">
            {currentStep > 1 && (
              <button
                onClick={handleBack}
                className="flex-1 py-3 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Назад
              </button>
            )}
            <button
              onClick={handleNext}
              className="flex-1 bg-blue-500 text-white py-3 rounded-lg hover:bg-blue-600 flex items-center justify-center space-x-2"
            >
              <span>{currentStep === steps.length - 1 ? 'Отправить' : 'Далее'}</span>
              {currentStep < steps.length - 1 && <ArrowRight className="w-4 h-4" />}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default App;
