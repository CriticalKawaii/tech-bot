import React, { useState, useEffect } from 'react';
import { Building, User, ArrowLeft, ArrowRight } from 'lucide-react';

const App = () => {
  const [currentStep, setCurrentStep] = useState(0);
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
      const tg = window.Telegram.WebApp;
      tg.ready();
      tg.expand();
    }
  }, []);

  const updateField = (fieldName, value) => {
    setFormData(prev => ({
      ...prev,
      [fieldName]: value
    }));

    if (errors[fieldName]) {
      setErrors(prev => ({
        ...prev,
        [fieldName]: undefined
      }));
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

  const validateCurrentStep = () => {
    const newErrors = {};

    if (currentStep === 1) {
      if (!formData.readiness) newErrors.readiness = 'Выберите готовность компании';
    }
    else if (currentStep === 2) {
      if (!formData.companyName.trim()) newErrors.companyName = 'Введите название компании';
      if (!formData.inn.trim()) newErrors.inn = 'Введите ИНН';
      else if (!validateINN(formData.inn)) newErrors.inn = 'ИНН должен содержать 10 или 12 цифр';
    }
    else if (currentStep === 3) {
      if (!formData.mentorName.trim()) newErrors.mentorName = 'Введите ФИО ментора';
      if (!formData.mentorEmail.trim()) newErrors.mentorEmail = 'Введите email';
      else if (!validateEmail(formData.mentorEmail)) newErrors.mentorEmail = 'Введите корректный email';
      if (!formData.mentorPhone.trim()) newErrors.mentorPhone = 'Введите телефон';
      else if (!validatePhone(formData.mentorPhone)) newErrors.mentorPhone = 'Введите корректный телефон';
      if (!formData.mentorTelegram.trim()) newErrors.mentorTelegram = 'Введите Telegram';
    }
    else if (currentStep === 4) {
      if (!formData.department.trim()) newErrors.department = 'Введите информацию о подразделении';
      if (!formData.participantsCount.trim()) newErrors.participantsCount = 'Введите количество участников';
      if (!formData.resources.trim()) newErrors.resources = 'Опишите предоставляемые ресурсы';
      if (!formData.shortTermGoals.trim()) newErrors.shortTermGoals = 'Опишите краткосрочные цели';
    }
    else if (currentStep === 5) {
      if (!formData.skillRequirements.trim()) newErrors.skillRequirements = 'Введите требования к навыкам';
    }
    else if (currentStep === 6) {
      if (!formData.workMode) newErrors.workMode = 'Выберите режим работы';
      if (!formData.workSchedule) newErrors.workSchedule = 'Выберите график работы';
      if (!formData.employmentProspects) newErrors.employmentProspects = 'Выберите перспективы трудоустройства';
      if (!formData.paymentAbility) newErrors.paymentAbility = 'Выберите возможность оплаты';
    }

    return newErrors;
  };

  const nextStep = () => {
    const stepErrors = validateCurrentStep();
    if (Object.keys(stepErrors).length > 0) {
      setErrors(stepErrors);
      return;
    }
    setErrors({});
    setCurrentStep(prev => prev + 1);
  };

  const prevStep = () => {
    setCurrentStep(prev => prev - 1);
  };

  const handleSubmit = () => {
    console.log('Submitting form data:', formData);

    if (window.Telegram?.WebApp) {
      const tg = window.Telegram.WebApp;
      tg.sendData(JSON.stringify(formData));
      console.log('Data submitted');
      tg.close();
    }

    alert('Заявка успешно отправлена!');
  };

  const renderStep = () => {
    if (currentStep === 0) {
      return (
        <div className="space-y-6">
          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold text-gray-800 mb-2">Добро пожаловать в Технохантер!</h1>
            <p className="text-gray-600">
              Эффективный механизм ранней профессиональной интеграции студентов и аспирантов
              ведущих российских вузов в R&D-процессы технологичных компаний Москвы
            </p>
          </div>

          <div className="space-y-4">
            <button
              onClick={nextStep}
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

    if (currentStep === 1) {
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
                onClick={() => updateField('readiness', option)}
                className={`w-full p-3 border rounded-lg text-left transition-colors ${formData.readiness === option
                  ? 'border-blue-500 bg-blue-50 text-blue-700'
                  : 'border-gray-300 hover:border-gray-400'
                  }`}
              >
                {option}
              </button>
            ))}

            <button
              onClick={() => {
                console.log('🧪 TEST BUTTON CLICKED');
                alert('Test button works!');
                handleSubmit();
              }}
              className="w-full bg-red-500 text-white py-2 rounded-lg"
            >
              🧪 TEST SUBMIT (TEMPORARY)
            </button>

          </div>

          {errors.readiness && (
            <p className="text-red-500 text-sm">{errors.readiness}</p>
          )}
        </div>
      );
    }

    if (currentStep === 2) {
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
              onChange={(e) => updateField('companyName', e.target.value)}
              className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${errors.companyName ? 'border-red-500' : 'border-gray-300'
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
              onChange={(e) => updateField('inn', e.target.value)}
              className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${errors.inn ? 'border-red-500' : 'border-gray-300'
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

    if (currentStep === 3) {
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
              onChange={(e) => updateField('mentorName', e.target.value)}
              className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${errors.mentorName ? 'border-red-500' : 'border-gray-300'
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
              onChange={(e) => updateField('mentorEmail', e.target.value)}
              className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${errors.mentorEmail ? 'border-red-500' : 'border-gray-300'
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
              onChange={(e) => updateField('mentorPhone', e.target.value)}
              className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${errors.mentorPhone ? 'border-red-500' : 'border-gray-300'
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
              onChange={(e) => updateField('mentorTelegram', e.target.value)}
              className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${errors.mentorTelegram ? 'border-red-500' : 'border-gray-300'
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

    if (currentStep === 4) {
      return (
        <div className="space-y-6">
          <h2 className="text-xl font-semibold text-gray-800">Детали стажировки</h2>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Структурное подразделение компании *
            </label>
            <textarea
              value={formData.department}
              onChange={(e) => updateField('department', e.target.value)}
              className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${errors.department ? 'border-red-500' : 'border-gray-300'
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
              onChange={(e) => updateField('participantsCount', e.target.value)}
              className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${errors.participantsCount ? 'border-red-500' : 'border-gray-300'
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
              onChange={(e) => updateField('resources', e.target.value)}
              className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${errors.resources ? 'border-red-500' : 'border-gray-300'
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
              onChange={(e) => updateField('shortTermGoals', e.target.value)}
              className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${errors.shortTermGoals ? 'border-red-500' : 'border-gray-300'
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

    if (currentStep === 5) {
      return (
        <div className="space-y-6">
          <h2 className="text-xl font-semibold text-gray-800">Требования к участникам</h2>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Требования к профильным навыкам и компетенциям *
            </label>
            <textarea
              value={formData.skillRequirements}
              onChange={(e) => updateField('skillRequirements', e.target.value)}
              className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${errors.skillRequirements ? 'border-red-500' : 'border-gray-300'
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
              onChange={(e) => updateField('otherRequirements', e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              rows="3"
              placeholder="Возраст 20-25 лет, опыт участия в хакатонах, английский язык..."
            />
            <p className="text-gray-500 text-sm mt-1">Необязательное поле</p>
          </div>
        </div>
      );
    }

    if (currentStep === 6) {
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
                  onClick={() => updateField('workMode', mode)}
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
                  onClick={() => updateField('workSchedule', schedule)}
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
                  onClick={() => updateField('employmentProspects', option)}
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
                  onClick={() => updateField('paymentAbility', payment)}
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
              onChange={(e) => updateField('otherWishes', e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              rows="3"
              placeholder="Дополнительные комментарии или пожелания..."
            />
            <p className="text-gray-500 text-sm mt-1">Необязательное поле</p>
          </div>
        </div>
      );
    }

    if (currentStep === 7) {
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

          <button
            onClick={handleSubmit}
            className="w-full bg-blue-500 text-white py-3 rounded-lg hover:bg-blue-600 transition-colors font-semibold"
          >
            Отправить заявку
          </button>
        </div>
      );
    }
  };

  const totalSteps = 7;

  return (
    <div className="min-h-screen bg-white">
      {currentStep > 0 && (
        <div className="w-full bg-gray-200 h-1">
          <div
            className="bg-blue-500 h-1 transition-all duration-300"
            style={{ width: `${(currentStep / totalSteps) * 100}%` }}
          />
        </div>
      )}

      <div className="max-w-md mx-auto p-6">
        {currentStep > 1 && (
          <button
            onClick={prevStep}
            className="mb-6 flex items-center space-x-2 text-blue-500 hover:text-blue-600"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Назад</span>
          </button>
        )}

        {renderStep()}

        {currentStep > 0 && currentStep < totalSteps && (
          <div className="mt-8">
            <button
              onClick={nextStep}
              className="w-full bg-blue-500 text-white py-3 rounded-lg hover:bg-blue-600 flex items-center justify-center space-x-2"
            >
              <span>{currentStep === totalSteps - 1 ? 'К подтверждению' : 'Далее'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default App;