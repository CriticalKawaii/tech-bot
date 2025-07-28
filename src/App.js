import React, { useState, useEffect } from 'react';
import { Building, User, ArrowLeft, ArrowRight } from 'lucide-react';

const App = () => {
  const [userType, setUserType] = useState(null);
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState({
    // Участник
    fio: '',
    age: '',
    livesInMoscow: true,
    email: '',
    phone: '',
    telegram: '',
    resumeLink: '',
    university: '',
    direction: '',
    educationLevel: '',
    status: '',
    course: '',
    // Компания
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
    // Общие
    workMode: '',
    workSchedule: '',
    paymentPossibility: '',
    // Уточнения для компании
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

  const validateURL = (url) => {
    if (!url.trim()) return false;
    try {
      new URL(url);
      return true;
    } catch {
      return /^(https?:\/\/)?([\da-z\.-]+)\.([a-z\.]{2,6})([\/\w \.-]*)*\/?$/i.test(url);
    }
  };



  const validateCurrentStep = () => {
    const newErrors = {};

    if (userType === 'participant') {
      if (currentStep === 1) {
        if (!formData.fio.trim()) newErrors.fio = 'Введите ФИО';
        if (!formData.age) newErrors.age = 'Введите возраст';
        else if (isNaN(formData.age) || formData.age < 16 || formData.age > 100)
          newErrors.age = 'Введите корректный возраст';
        if (!formData.email.trim()) newErrors.email = 'Введите email';
        else if (!validateEmail(formData.email)) newErrors.email = 'Введите корректный email';
        if (!formData.phone.trim()) newErrors.phone = 'Введите телефон';
        else if (!validatePhone(formData.phone)) newErrors.phone = 'Введите корректный телефон';
        if (!formData.telegram.trim()) newErrors.telegram = 'Введите Telegram';
        if (!formData.resumeLink.trim()) newErrors.resumeLink = 'Введите ссылку на резюме';
        else if (!validateURL(formData.resumeLink)) newErrors.resumeLink = 'Введите корректную ссылку';
      }
      else if (currentStep === 2) {
        if (!formData.university.trim()) newErrors.university = 'Введите название ВУЗа';
        if (!formData.direction.trim()) newErrors.direction = 'Введите направление обучения';
        if (!formData.educationLevel) newErrors.educationLevel = 'Выберите уровень образования';
        if (!formData.status) newErrors.status = 'Выберите статус обучения';
        if (formData.status === 'Студент' && !formData.course)
          newErrors.course = 'Выберите курс';
      }
      else if (currentStep === 3) {
        if (!formData.workMode) newErrors.workMode = 'Выберите режим работы';
        if (!formData.workSchedule) newErrors.workSchedule = 'Выберите график работы';
        if (!formData.paymentPossibility) newErrors.paymentPossibility = 'Выберите возможность оплаты';
      }
    }
    else if (userType === 'company') {
      if (currentStep === 1) {
        if (!formData.readiness) newErrors.readiness = 'Выберите готовность компании';
        if (!formData.companyName.trim()) newErrors.companyName = 'Введите название компании';
        if (!formData.inn.trim()) newErrors.inn = 'Введите ИНН';
        else if (!validateINN(formData.inn)) newErrors.inn = 'ИНН должен содержать 10 или 12 цифр';
        if (!formData.mentorName.trim()) newErrors.mentorName = 'Введите ФИО ментора';
        if (!formData.mentorEmail.trim()) newErrors.mentorEmail = 'Введите email';
        else if (!validateEmail(formData.mentorEmail)) newErrors.mentorEmail = 'Введите корректный email';
        if (!formData.mentorPhone.trim()) newErrors.mentorPhone = 'Введите телефон';
        else if (!validatePhone(formData.mentorPhone)) newErrors.mentorPhone = 'Введите корректный телефон';
        if (!formData.mentorTelegram.trim()) newErrors.mentorTelegram = 'Введите Telegram';
      }
      else if (currentStep === 2) {
        if (!formData.department.trim()) newErrors.department = 'Введите информацию о подразделении';
        if (!formData.participantsCount.trim()) newErrors.participantsCount = 'Введите количество участников';
        if (!formData.resources.trim()) newErrors.resources = 'Опишите предоставляемые ресурсы';
        if (!formData.shortTermGoals.trim()) newErrors.shortTermGoals = 'Опишите краткосрочные цели';
      }
      else if (currentStep === 3) {
        if (!formData.skillRequirements.trim()) newErrors.skillRequirements = 'Введите требования к навыкам';
        if (!formData.workMode) newErrors.workMode = 'Выберите режим работы';
        if (!formData.workSchedule) newErrors.workSchedule = 'Выберите график работы';
        if (!formData.employmentProspects) newErrors.employmentProspects = 'Выберите перспективы трудоустройства';
        if (!formData.paymentAbility) newErrors.paymentAbility = 'Выберите возможность оплаты';
      }
    }

    return newErrors;
  };

  const getCourseOptions = () => {
    if (formData.educationLevel === 'Бакалавриат') return ['1', '2', '3', '4'];
    if (formData.educationLevel === 'Специалитет') return ['1', '2', '3', '4', '5'];
    if (formData.educationLevel === 'Магистратура') return ['1', '2'];
    if (formData.educationLevel === 'Аспирантура') return ['1', '2'];
    return [];
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
    if (currentStep === 1 && userType) {
      setUserType(null);
      setCurrentStep(0);
    } else {
      setCurrentStep(prev => prev - 1);
    }
  };

  const handleSubmit = () => {
    const submissionData = {
      ...formData,
      applicationType: userType,
      submittedAt: new Date().toISOString()
    };

    console.log('Submitting form data:', submissionData);

    if (window.Telegram?.WebApp) {
      const tg = window.Telegram.WebApp;
      tg.sendData(JSON.stringify(submissionData));
      tg.close();
    }
  };

  const renderUserTypeSelection = () => {
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
            onClick={() => {
              setUserType('participant');
              setCurrentStep(1);
            }}
            className="w-full p-4 border-2 border-green-500 rounded-lg hover:bg-green-50 transition-colors flex items-center space-x-3"
          >
            <User className="w-6 h-6 text-green-500" />
            <div className="text-left">
              <div className="font-semibold text-gray-800">Участник программы</div>
              <div className="text-sm text-gray-600">Подать заявку на стажировку</div>
            </div>
          </button>
        </div>
      </div>
    );
  };

  const renderParticipantForm = () => {
    if (currentStep === 1) {
      return (
        <div className="space-y-6">
          <h2 className="text-xl font-semibold text-gray-800">Основная информация</h2>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">ФИО *</label>
            <input
              type="text"
              value={formData.fio}
              onChange={(e) => updateField('fio', e.target.value)}
              className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 ${errors.fio ? 'border-red-500' : 'border-gray-300'}`}
              placeholder="Иванов Иван Иванович"
            />
            {errors.fio && <p className="text-red-500 text-sm mt-1">{errors.fio}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Возраст *</label>
            <input
              type="number"
              value={formData.age}
              onChange={(e) => updateField('age', e.target.value)}
              className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 ${errors.age ? 'border-red-500' : 'border-gray-300'}`}
              placeholder="21"
              min="16"
              max="100"
            />
            {errors.age && <p className="text-red-500 text-sm mt-1">{errors.age}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Я проживаю в Москве</label>
            <div className="flex space-x-4">
              <button
                onClick={() => updateField('livesInMoscow', true)}
                className={`px-6 py-2 border rounded-lg ${formData.livesInMoscow === true ? 'bg-blue-500 text-white' : 'border-gray-300'}`}
              >
                Да
              </button>
              <button
                onClick={() => updateField('livesInMoscow', false)}
                className={`px-6 py-2 border rounded-lg ${formData.livesInMoscow === false ? 'bg-blue-500 text-white' : 'border-gray-300'}`}
              >
                Нет
              </button>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Email *</label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => updateField('email', e.target.value)}
              className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 ${errors.email ? 'border-red-500' : 'border-gray-300'}`}
              placeholder="ivanov@example.com"
            />
            {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Телефон *</label>
            <input
              type="tel"
              value={formData.phone}
              onChange={(e) => updateField('phone', e.target.value)}
              className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 ${errors.phone ? 'border-red-500' : 'border-gray-300'}`}
              placeholder="+7 (999) 123-45-67"
            />
            {errors.phone && <p className="text-red-500 text-sm mt-1">{errors.phone}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Telegram *</label>
            <input
              type="text"
              value={formData.telegram}
              onChange={(e) => updateField('telegram', e.target.value)}
              className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 ${errors.telegram ? 'border-red-500' : 'border-gray-300'}`}
              placeholder="@username"
            />
            {errors.telegram && <p className="text-red-500 text-sm mt-1">{errors.telegram}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Ссылка на резюме *</label>
            <p className="text-xs text-gray-500 mb-2">
              Разместите резюме на Google Drive, Яндекс.Диск, или другом облачном сервисе и вставьте ссылку
            </p>
            <input
              type="url"
              value={formData.resumeLink}
              onChange={(e) => updateField('resumeLink', e.target.value)}
              className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 ${errors.resumeLink ? 'border-red-500' : 'border-gray-300'}`}
              placeholder="https://drive.google.com/file/d/..."
            />
            {errors.resumeLink && <p className="text-red-500 text-sm mt-1">{errors.resumeLink}</p>}
          </div>
        </div>
      );
    }

    if (currentStep === 2) {
      return (
        <div className="space-y-6">
          <h2 className="text-xl font-semibold text-gray-800">Информация об образовании</h2>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Наименование ВУЗа *</label>
            <input
              type="text"
              value={formData.university}
              onChange={(e) => updateField('university', e.target.value)}
              className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 ${errors.university ? 'border-red-500' : 'border-gray-300'}`}
              placeholder="МГУ им. М.В. Ломоносова"
            />
            {errors.university && <p className="text-red-500 text-sm mt-1">{errors.university}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Направление обучения *</label>
            <input
              type="text"
              value={formData.direction}
              onChange={(e) => updateField('direction', e.target.value)}
              className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 ${errors.direction ? 'border-red-500' : 'border-gray-300'}`}
              placeholder="Прикладная математика и информатика"
            />
            {errors.direction && <p className="text-red-500 text-sm mt-1">{errors.direction}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Уровень высшего образования *</label>
            <div className="space-y-2">
              {['Бакалавриат', 'Специалитет', 'Магистратура', 'Аспирантура'].map((level) => (
                <button
                  key={level}
                  onClick={() => {
                    updateField('educationLevel', level);
                    updateField('course', '');
                  }}
                  className={`w-full p-3 border rounded-lg text-left ${formData.educationLevel === level
                    ? 'border-blue-500 bg-blue-50 text-blue-700'
                    : 'border-gray-300 hover:border-gray-400'
                    }`}
                >
                  {level}
                </button>
              ))}
            </div>
            {errors.educationLevel && <p className="text-red-500 text-sm mt-1">{errors.educationLevel}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Статус обучения *</label>
            <div className="space-y-2">
              {['Студент', 'Выпускник'].map((status) => (
                <button
                  key={status}
                  onClick={() => {
                    updateField('status', status);
                    if (status === 'Выпускник') updateField('course', '');
                  }}
                  className={`w-full p-3 border rounded-lg text-left ${formData.status === status
                    ? 'border-blue-500 bg-blue-50 text-blue-700'
                    : 'border-gray-300 hover:border-gray-400'
                    }`}
                >
                  {status}
                </button>
              ))}
            </div>
            {errors.status && <p className="text-red-500 text-sm mt-1">{errors.status}</p>}
          </div>

          {formData.status === 'Студент' && formData.educationLevel && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Курс *</label>
              <select
                value={formData.course}
                onChange={(e) => updateField('course', e.target.value)}
                className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 ${errors.course ? 'border-red-500' : 'border-gray-300'
                  }`}
              >
                <option value="">Выберите курс</option>
                {getCourseOptions().map((course) => (
                  <option key={course} value={course}>{course}</option>
                ))}
              </select>
              {errors.course && <p className="text-red-500 text-sm mt-1">{errors.course}</p>}
            </div>
          )}
        </div>
      );
    }

    if (currentStep === 3) {
      return (
        <div className="space-y-6">
          <h2 className="text-xl font-semibold text-gray-800">Предпочтительные условия стажировки</h2>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">Режим работы *</label>
            <div className="space-y-2">
              {['Офлайн', 'Онлайн', 'Гибрид'].map((mode) => (
                <button
                  key={mode}
                  onClick={() => updateField('workMode', mode)}
                  className={`w-full p-3 border rounded-lg text-left ${formData.workMode === mode
                    ? 'border-blue-500 bg-blue-50 text-blue-700'
                    : 'border-gray-300 hover:border-gray-400'
                    }`}
                >
                  {mode}
                </button>
              ))}
            </div>
            {errors.workMode && <p className="text-red-500 text-sm mt-1">{errors.workMode}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">График работы (часов в неделю) *</label>
            <div className="space-y-2">
              {['20 часов', '40 часов', 'Другое'].map((schedule) => (
                <button
                  key={schedule}
                  onClick={() => updateField('workSchedule', schedule)}
                  className={`w-full p-3 border rounded-lg text-left ${formData.workSchedule === schedule
                    ? 'border-blue-500 bg-blue-50 text-blue-700'
                    : 'border-gray-300 hover:border-gray-400'
                    }`}
                >
                  {schedule}
                </button>
              ))}
            </div>
            {errors.workSchedule && <p className="text-red-500 text-sm mt-1">{errors.workSchedule}</p>}
          </div>

          {formData.workSchedule === 'Другое' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Количество часов работы *</label>
              <input
                type="number"
                value={formData.customHours || ''}
                onChange={(e) => updateField('customHours', e.target.value)}
                className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 border-gray-300"
                placeholder="30"
                min="1"
                max="60"
              />
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">Возможность оплаты *</label>
            <div className="space-y-2">
              {['Только с оплатой', 'Можно без оплаты', 'Без разницы'].map((payment) => (
                <button
                  key={payment}
                  onClick={() => updateField('paymentPossibility', payment)}
                  className={`w-full p-3 border rounded-lg text-left ${formData.paymentPossibility === payment
                    ? 'border-blue-500 bg-blue-50 text-blue-700'
                    : 'border-gray-300 hover:border-gray-400'
                    }`}
                >
                  {payment}
                </button>
              ))}
            </div>
            {errors.paymentPossibility && <p className="text-red-500 text-sm mt-1">{errors.paymentPossibility}</p>}
          </div>
        </div>
      );
    }

    if (currentStep === 4) {
      return (
        <div className="space-y-6">
          <div className="text-center">
            <h2 className="text-xl font-semibold text-gray-800 mb-2">Подтверждение заявки</h2>
            <p className="text-gray-600">Проверьте введенную информацию перед отправкой</p>
          </div>

          <div className="bg-gray-50 rounded-lg p-6 space-y-4">
            <div className="grid grid-cols-1 gap-3 text-sm">
              <div><strong>ФИО:</strong> {formData.fio}</div>
              <div><strong>Возраст:</strong> {formData.age}</div>
              <div><strong>Проживание в Москве:</strong> {formData.livesInMoscow === true ? 'Да' : formData.livesInMoscow === false ? 'Нет' : 'Не указано'}</div>
              <div><strong>Email:</strong> {formData.email}</div>
              <div><strong>Телефон:</strong> {formData.phone}</div>
              <div><strong>Telegram:</strong> {formData.telegram}</div>
              <div><strong>Резюме:</strong> <a href={formData.resumeLink} target="_blank" rel="noopener noreferrer" className="text-blue-500 underline">Ссылка на резюме</a></div>
              <div><strong>ВУЗ:</strong> {formData.university}</div>
              <div><strong>Направление:</strong> {formData.direction}</div>
              <div><strong>Уровень образования:</strong> {formData.educationLevel}</div>
              <div><strong>Статус:</strong> {formData.status}</div>
              {formData.course && <div><strong>Курс:</strong> {formData.course}</div>}
              <div><strong>Режим работы:</strong> {formData.workMode}</div>
              <div><strong>График:</strong> {formData.workSchedule}</div>
              <div><strong>Оплата:</strong> {formData.paymentPossibility}</div>
            </div>
          </div>

          <div className="text-center text-sm text-gray-600">
            <p>Мы в скором времени свяжемся с вами.</p>
            <p>По всем вопросам обращайтесь к менеджеру: <a href="https://t.me/astafeva_alisiia" className="text-blue-500">@astafeva_alisiia</a></p>
          </div>

          <button
            onClick={handleSubmit}
            className="w-full bg-green-500 text-white py-3 rounded-lg hover:bg-green-600 transition-colors font-semibold"
          >
            Отправить заявку
          </button>
        </div>
      );
    }
  };

  const renderCompanyForm = () => {
    if (currentStep === 1) {
      const readinessOptions = [
        'Да, готовы уже сейчас',
        'Да, готовы с сентября',
        'Не уверены',
        'Не готовы'
      ];

      return (
        <div className="space-y-6">
          <div>
            <h2 className="text-xl font-semibold text-gray-800 mb-1">Страница 1</h2>
            <p className="text-sm text-gray-600 mb-4">Основная информация о компании и менторе</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Готовность компании принять участника(-ов) на стажировку *
            </label>
            <div className="space-y-2">
              {readinessOptions.map((option) => (
                <button
                  key={option}
                  onClick={() => updateField('readiness', option)}
                  className={`w-full p-3 border rounded-lg text-left ${formData.readiness === option
                    ? 'border-blue-500 bg-blue-50 text-blue-700'
                    : 'border-gray-300 hover:border-gray-400'
                    }`}
                >
                  {option}
                </button>
              ))}
            </div>
            {errors.readiness && <p className="text-red-500 text-sm mt-1">{errors.readiness}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Наименование компании *</label>
            <input
              type="text"
              value={formData.companyName}
              onChange={(e) => updateField('companyName', e.target.value)}
              className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 ${errors.companyName ? 'border-red-500' : 'border-gray-300'}`}
              placeholder="ООО Технологии будущего"
            />
            {errors.companyName && <p className="text-red-500 text-sm mt-1">{errors.companyName}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">ИНН компании *</label>
            <input
              type="text"
              value={formData.inn}
              onChange={(e) => updateField('inn', e.target.value)}
              className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 ${errors.inn ? 'border-red-500' : 'border-gray-300'}`}
              placeholder="1234567890"
              maxLength="12"
            />
            {errors.inn && <p className="text-red-500 text-sm mt-1">{errors.inn}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">ФИО и должность ментора *</label>
            <input
              type="text"
              value={formData.mentorName}
              onChange={(e) => updateField('mentorName', e.target.value)}
              className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 ${errors.mentorName ? 'border-red-500' : 'border-gray-300'}`}
              placeholder="Иванов Иван Иванович, ведущий разработчик"
            />
            {errors.mentorName && <p className="text-red-500 text-sm mt-1">{errors.mentorName}</p>}
            <p className="text-gray-500 text-xs mt-1">Ментор - сотрудник компании, наставник для участника программы</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Email ментора *</label>
            <input
              type="email"
              value={formData.mentorEmail}
              onChange={(e) => updateField('mentorEmail', e.target.value)}
              className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 ${errors.mentorEmail ? 'border-red-500' : 'border-gray-300'}`}
              placeholder="mentor@company.ru"
            />
            {errors.mentorEmail && <p className="text-red-500 text-sm mt-1">{errors.mentorEmail}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Телефон ментора *</label>
            <input
              type="tel"
              value={formData.mentorPhone}
              onChange={(e) => updateField('mentorPhone', e.target.value)}
              className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 ${errors.mentorPhone ? 'border-red-500' : 'border-gray-300'}`}
              placeholder="+7 (999) 123-45-67"
            />
            {errors.mentorPhone && <p className="text-red-500 text-sm mt-1">{errors.mentorPhone}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Telegram ментора *</label>
            <input
              type="text"
              value={formData.mentorTelegram}
              onChange={(e) => updateField('mentorTelegram', e.target.value)}
              className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 ${errors.mentorTelegram ? 'border-red-500' : 'border-gray-300'}`}
              placeholder="@username"
            />
            {errors.mentorTelegram && <p className="text-red-500 text-sm mt-1">{errors.mentorTelegram}</p>}
          </div>
        </div>
      );
    }

    if (currentStep === 2) {
      return (
        <div className="space-y-6">
          <div>
            <h2 className="text-xl font-semibold text-gray-800 mb-1">Страница 2</h2>
            <p className="text-sm text-gray-600 mb-4">Детали стажировки</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Структурное подразделение компании *
            </label>
            <textarea
              value={formData.department}
              onChange={(e) => updateField('department', e.target.value)}
              className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 ${errors.department ? 'border-red-500' : 'border-gray-300'}`}
              rows="3"
              placeholder="Отдел разработки / команда AI-проектов"
            />
            {errors.department && <p className="text-red-500 text-sm mt-1">{errors.department}</p>}
            <p className="text-gray-500 text-xs mt-1">
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
              className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 ${errors.participantsCount ? 'border-red-500' : 'border-gray-300'}`}
              placeholder="2-3 человека"
            />
            {errors.participantsCount && <p className="text-red-500 text-sm mt-1">{errors.participantsCount}</p>}
            <p className="text-gray-500 text-xs mt-1">
              Если количество не ограничено, укажите предполагаемый диапазон
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Предоставляемые ресурсы *
            </label>
            <textarea
              value={formData.resources}
              onChange={(e) => updateField('resources', e.target.value)}
              className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 ${errors.resources ? 'border-red-500' : 'border-gray-300'}`}
              rows="4"
              placeholder="Ноутбук, доступ к облачным сервисам, лабораторные мощности, опытные научные сотрудники..."
            />
            {errors.resources && <p className="text-red-500 text-sm mt-1">{errors.resources}</p>}
            <p className="text-gray-500 text-xs mt-1">
              Опишите инфраструктурные и информационные ресурсы для развития участника
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Предполагаемые краткосрочные цели компании *
            </label>
            <textarea
              value={formData.shortTermGoals}
              onChange={(e) => updateField('shortTermGoals', e.target.value)}
              className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 ${errors.shortTermGoals ? 'border-red-500' : 'border-gray-300'}`}
              rows="4"
              placeholder="Разработка нового модуля, исследование в области ML, оптимизация процессов..."
            />
            {errors.shortTermGoals && <p className="text-red-500 text-sm mt-1">{errors.shortTermGoals}</p>}
            <p className="text-gray-500 text-xs mt-1">
              Конкретные цели до конца года, в достижении которых будет задействован участник
            </p>
          </div>
        </div>
      );
    }

    if (currentStep === 3) {
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
          <div>
            <h2 className="text-xl font-semibold text-gray-800 mb-1">Страница 3</h2>
            <p className="text-sm text-gray-600 mb-4">Требования к участникам</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Требования к профильным навыкам и компетенциям *
            </label>
            <textarea
              value={formData.skillRequirements}
              onChange={(e) => updateField('skillRequirements', e.target.value)}
              className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 ${errors.skillRequirements ? 'border-red-500' : 'border-gray-300'}`}
              rows="4"
              placeholder="Python, машинное обучение, опыт с TensorFlow, знание алгоритмов..."
            />
            {errors.skillRequirements && <p className="text-red-500 text-sm mt-1">{errors.skillRequirements}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Другие требования к участникам
            </label>
            <textarea
              value={formData.otherRequirements}
              onChange={(e) => updateField('otherRequirements', e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              rows="3"
              placeholder="Возраст, опыт участия в проектах, знание английского..."
            />
            <p className="text-gray-500 text-xs mt-1">
              Дополнительные пожелания к участникам
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Предпочтительный формат работы участников
            </label>

            <div className="mb-4">
              <p className="text-sm text-gray-600 mb-2">Режим работы *</p>
              <div className="space-y-2">
                {workModes.map((mode) => (
                  <button
                    key={mode}
                    onClick={() => updateField('workMode', mode)}
                    className={`w-full p-3 border rounded-lg text-left ${formData.workMode === mode
                      ? 'border-blue-500 bg-blue-50 text-blue-700'
                      : 'border-gray-300 hover:border-gray-400'
                      }`}
                  >
                    {mode}
                  </button>
                ))}
              </div>
              {errors.workMode && <p className="text-red-500 text-sm mt-1">{errors.workMode}</p>}
            </div>

            <div>
              <p className="text-sm text-gray-600 mb-2">График работы *</p>
              <div className="space-y-2">
                {schedules.map((schedule) => (
                  <button
                    key={schedule}
                    onClick={() => updateField('workSchedule', schedule)}
                    className={`w-full p-3 border rounded-lg text-left ${formData.workSchedule === schedule
                      ? 'border-blue-500 bg-blue-50 text-blue-700'
                      : 'border-gray-300 hover:border-gray-400'
                      }`}
                  >
                    {schedule}
                  </button>
                ))}
              </div>
              {errors.workSchedule && <p className="text-red-500 text-sm mt-1">{errors.workSchedule}</p>}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Перспектива трудоустройства по итогам стажировки *
            </label>
            <div className="space-y-2">
              {employment.map((option) => (
                <button
                  key={option}
                  onClick={() => updateField('employmentProspects', option)}
                  className={`w-full p-3 border rounded-lg text-left ${formData.employmentProspects === option
                    ? 'border-blue-500 bg-blue-50 text-blue-700'
                    : 'border-gray-300 hover:border-gray-400'
                    }`}
                >
                  {option}
                </button>
              ))}
            </div>
            {errors.employmentProspects && <p className="text-red-500 text-sm mt-1">{errors.employmentProspects}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Возможность оплачивать работу участника *
            </label>
            <div className="space-y-2">
              {payments.map((payment) => (
                <button
                  key={payment}
                  onClick={() => updateField('paymentAbility', payment)}
                  className={`w-full p-3 border rounded-lg text-left ${formData.paymentAbility === payment
                    ? 'border-blue-500 bg-blue-50 text-blue-700'
                    : 'border-gray-300 hover:border-gray-400'
                    }`}
                >
                  {payment}
                </button>
              ))}
            </div>
            {errors.paymentAbility && <p className="text-red-500 text-sm mt-1">{errors.paymentAbility}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Прочие пожелания
            </label>
            <textarea
              value={formData.otherWishes}
              onChange={(e) => updateField('otherWishes', e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              rows="3"
              placeholder="Вопросы, предложения по формату стажировки..."
            />
          </div>
        </div>
      );
    }

    if (currentStep === 4) {
      return (
        <div className="space-y-6">
          <div className="text-center">
            <h2 className="text-xl font-semibold text-gray-800 mb-2">Подтверждение заявки</h2>
            <p className="text-gray-600">Проверьте введенную информацию перед отправкой</p>
          </div>

          <div className="bg-gray-50 rounded-lg p-6 space-y-4">
            <div className="grid grid-cols-1 gap-3 text-sm">
              <div><strong>Готовность:</strong> {formData.readiness}</div>
              <div><strong>Компания:</strong> {formData.companyName}</div>
              <div><strong>ИНН:</strong> {formData.inn}</div>
              <div><strong>Ментор:</strong> {formData.mentorName}</div>
              <div><strong>Email:</strong> {formData.mentorEmail}</div>
              <div><strong>Телефон:</strong> {formData.mentorPhone}</div>
              <div><strong>Telegram:</strong> {formData.mentorTelegram}</div>
              <div><strong>Подразделение:</strong> {formData.department}</div>
              <div><strong>Количество участников:</strong> {formData.participantsCount}</div>
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

  const getTotalSteps = () => {
    if (userType === 'participant') return 4;
    if (userType === 'company') return 4;
    return 0;
  };

  const renderContent = () => {
    if (!userType) return renderUserTypeSelection();
    if (userType === 'participant') return renderParticipantForm();
    if (userType === 'company') return renderCompanyForm();
  };

  return (
    <div className="min-h-screen bg-white">
      {userType && currentStep > 0 && (
        <div className="w-full bg-gray-200 h-1">
          <div
            className="bg-blue-500 h-1 transition-all duration-300"
            style={{ width: `${(currentStep / getTotalSteps()) * 100}%` }}
          />
        </div>
      )}

      <div className="max-w-md mx-auto p-6">
        {userType && currentStep > 0 && (
          <button
            onClick={prevStep}
            className="mb-6 flex items-center space-x-2 text-blue-500 hover:text-blue-600"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Назад</span>
          </button>
        )}

        {renderContent()}

        {userType && currentStep > 0 && currentStep < getTotalSteps() && (
          <div className="mt-8">
            <button
              onClick={nextStep}
              className="w-full bg-blue-500 text-white py-3 rounded-lg hover:bg-blue-600 flex items-center justify-center space-x-2"
            >
              <span>{currentStep === getTotalSteps() - 1 ? 'К подтверждению' : 'Далее'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default App;