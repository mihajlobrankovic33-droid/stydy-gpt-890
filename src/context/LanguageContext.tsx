import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";

export type Language = "sr" | "en" | "de" | "fr" | "es" | "it" | "ru" | "zh" | "ja" | "ar";

interface Translations {
  menu: string;
  lightMode: string;
  darkMode: string;
  editProfile: string;
  chatHistory: string;
  clearHistory: string;
  checkUpdates: string;
  admin: string;
  signOut: string;
  upgradeToPro: string;
  languages: string;
  askAnything: string;
  takePhoto: string;
  chooseFromGallery: string;
  sharePdf: string;
  voiceChat: string;
  send: string;
  days: string;
  lifetimePro: string;
  cancel: string;
  enter: string;
  password: string;
  wrongPassword: string;
  checkingUpdates: string;
  pleaseWait: string;
  error: string;
  cannotCheckUpdate: string;
  addMessage: string;
  askAboutImage: string;
  speakNow: string;
  listening: string;
  processing: string;
  tapToSpeak: string;
  stopListening: string;
}

const translations: Record<Language, Translations> = {
  sr: {
    menu: "Meni",
    lightMode: "Svetli režim",
    darkMode: "Tamni režim",
    editProfile: "Uredi profil / Avatar",
    chatHistory: "Istorija ćaskanja",
    clearHistory: "Obriši istoriju",
    checkUpdates: "Proveri ažuriranje",
    admin: "Admin",
    signOut: "Odjavi se",
    upgradeToPro: "Nadogradi na Pro",
    languages: "Jezici",
    askAnything: "Pitaj bilo šta...",
    takePhoto: "Slikaj",
    chooseFromGallery: "Izaberi iz galerije",
    sharePdf: "Podeli PDF",
    voiceChat: "Glasovni čet",
    send: "Pošalji",
    days: "dana",
    lifetimePro: "Lifetime Pro",
    cancel: "Odustani",
    enter: "Uđi",
    password: "Šifra...",
    wrongPassword: "Pogrešna šifra",
    checkingUpdates: "Provera ažuriranja…",
    pleaseWait: "Molimo sačekaj.",
    error: "Greška",
    cannotCheckUpdate: "Nije moguće proveriti ažuriranje.",
    addMessage: "Dodaj poruku...",
    askAboutImage: "Pitaj o ovoj slici...",
    speakNow: "Govori sada",
    listening: "Slušam...",
    processing: "Obrađujem...",
    tapToSpeak: "Dodirni za govor",
    stopListening: "Zaustavi",
  },
  en: {
    menu: "Menu",
    lightMode: "Light mode",
    darkMode: "Dark mode",
    editProfile: "Edit profile / Avatar",
    chatHistory: "Chat history",
    clearHistory: "Clear history",
    checkUpdates: "Check for updates",
    admin: "Admin",
    signOut: "Sign out",
    upgradeToPro: "Upgrade to Pro",
    languages: "Languages",
    askAnything: "Ask anything...",
    takePhoto: "Take photo",
    chooseFromGallery: "Choose from gallery",
    sharePdf: "Share PDF",
    voiceChat: "Voice chat",
    send: "Send",
    days: "days",
    lifetimePro: "Lifetime Pro",
    cancel: "Cancel",
    enter: "Enter",
    password: "Password...",
    wrongPassword: "Wrong password",
    checkingUpdates: "Checking for updates…",
    pleaseWait: "Please wait.",
    error: "Error",
    cannotCheckUpdate: "Cannot check for updates.",
    addMessage: "Add a message...",
    askAboutImage: "Ask about this image...",
    speakNow: "Speak now",
    listening: "Listening...",
    processing: "Processing...",
    tapToSpeak: "Tap to speak",
    stopListening: "Stop",
  },
  de: {
    menu: "Menü",
    lightMode: "Heller Modus",
    darkMode: "Dunkler Modus",
    editProfile: "Profil bearbeiten / Avatar",
    chatHistory: "Chat-Verlauf",
    clearHistory: "Verlauf löschen",
    checkUpdates: "Nach Updates suchen",
    admin: "Admin",
    signOut: "Abmelden",
    upgradeToPro: "Auf Pro upgraden",
    languages: "Sprachen",
    askAnything: "Frag etwas...",
    takePhoto: "Foto aufnehmen",
    chooseFromGallery: "Aus Galerie wählen",
    sharePdf: "PDF teilen",
    voiceChat: "Sprachchat",
    send: "Senden",
    days: "Tage",
    lifetimePro: "Lifetime Pro",
    cancel: "Abbrechen",
    enter: "Eingeben",
    password: "Passwort...",
    wrongPassword: "Falsches Passwort",
    checkingUpdates: "Suche nach Updates…",
    pleaseWait: "Bitte warten.",
    error: "Fehler",
    cannotCheckUpdate: "Updates können nicht überprüft werden.",
    addMessage: "Nachricht hinzufügen...",
    askAboutImage: "Frag zu diesem Bild...",
    speakNow: "Jetzt sprechen",
    listening: "Höre zu...",
    processing: "Verarbeite...",
    tapToSpeak: "Tippen zum Sprechen",
    stopListening: "Stopp",
  },
  fr: {
    menu: "Menu",
    lightMode: "Mode clair",
    darkMode: "Mode sombre",
    editProfile: "Modifier profil / Avatar",
    chatHistory: "Historique des chats",
    clearHistory: "Effacer l'historique",
    checkUpdates: "Vérifier les mises à jour",
    admin: "Admin",
    signOut: "Déconnexion",
    upgradeToPro: "Passer à Pro",
    languages: "Langues",
    askAnything: "Posez une question...",
    takePhoto: "Prendre une photo",
    chooseFromGallery: "Choisir de la galerie",
    sharePdf: "Partager PDF",
    voiceChat: "Chat vocal",
    send: "Envoyer",
    days: "jours",
    lifetimePro: "Lifetime Pro",
    cancel: "Annuler",
    enter: "Entrer",
    password: "Mot de passe...",
    wrongPassword: "Mot de passe incorrect",
    checkingUpdates: "Vérification des mises à jour…",
    pleaseWait: "Veuillez patienter.",
    error: "Erreur",
    cannotCheckUpdate: "Impossible de vérifier les mises à jour.",
    addMessage: "Ajouter un message...",
    askAboutImage: "Posez une question sur cette image...",
    speakNow: "Parlez maintenant",
    listening: "Écoute...",
    processing: "Traitement...",
    tapToSpeak: "Appuyez pour parler",
    stopListening: "Arrêter",
  },
  es: {
    menu: "Menú",
    lightMode: "Modo claro",
    darkMode: "Modo oscuro",
    editProfile: "Editar perfil / Avatar",
    chatHistory: "Historial de chat",
    clearHistory: "Borrar historial",
    checkUpdates: "Buscar actualizaciones",
    admin: "Admin",
    signOut: "Cerrar sesión",
    upgradeToPro: "Actualizar a Pro",
    languages: "Idiomas",
    askAnything: "Pregunta lo que sea...",
    takePhoto: "Tomar foto",
    chooseFromGallery: "Elegir de galería",
    sharePdf: "Compartir PDF",
    voiceChat: "Chat de voz",
    send: "Enviar",
    days: "días",
    lifetimePro: "Lifetime Pro",
    cancel: "Cancelar",
    enter: "Entrar",
    password: "Contraseña...",
    wrongPassword: "Contraseña incorrecta",
    checkingUpdates: "Buscando actualizaciones…",
    pleaseWait: "Por favor espera.",
    error: "Error",
    cannotCheckUpdate: "No se puede verificar actualizaciones.",
    addMessage: "Añadir mensaje...",
    askAboutImage: "Pregunta sobre esta imagen...",
    speakNow: "Habla ahora",
    listening: "Escuchando...",
    processing: "Procesando...",
    tapToSpeak: "Toca para hablar",
    stopListening: "Detener",
  },
  it: {
    menu: "Menu",
    lightMode: "Modalità chiara",
    darkMode: "Modalità scura",
    editProfile: "Modifica profilo / Avatar",
    chatHistory: "Cronologia chat",
    clearHistory: "Cancella cronologia",
    checkUpdates: "Controlla aggiornamenti",
    admin: "Admin",
    signOut: "Esci",
    upgradeToPro: "Passa a Pro",
    languages: "Lingue",
    askAnything: "Chiedi qualsiasi cosa...",
    takePhoto: "Scatta foto",
    chooseFromGallery: "Scegli dalla galleria",
    sharePdf: "Condividi PDF",
    voiceChat: "Chat vocale",
    send: "Invia",
    days: "giorni",
    lifetimePro: "Lifetime Pro",
    cancel: "Annulla",
    enter: "Entra",
    password: "Password...",
    wrongPassword: "Password errata",
    checkingUpdates: "Controllo aggiornamenti…",
    pleaseWait: "Attendere prego.",
    error: "Errore",
    cannotCheckUpdate: "Impossibile verificare aggiornamenti.",
    addMessage: "Aggiungi messaggio...",
    askAboutImage: "Chiedi di questa immagine...",
    speakNow: "Parla ora",
    listening: "Ascolto...",
    processing: "Elaborazione...",
    tapToSpeak: "Tocca per parlare",
    stopListening: "Ferma",
  },
  ru: {
    menu: "Меню",
    lightMode: "Светлый режим",
    darkMode: "Тёмный режим",
    editProfile: "Редактировать профиль / Аватар",
    chatHistory: "История чата",
    clearHistory: "Очистить историю",
    checkUpdates: "Проверить обновления",
    admin: "Админ",
    signOut: "Выйти",
    upgradeToPro: "Перейти на Pro",
    languages: "Языки",
    askAnything: "Спроси что угодно...",
    takePhoto: "Сделать фото",
    chooseFromGallery: "Выбрать из галереи",
    sharePdf: "Поделиться PDF",
    voiceChat: "Голосовой чат",
    send: "Отправить",
    days: "дней",
    lifetimePro: "Lifetime Pro",
    cancel: "Отмена",
    enter: "Войти",
    password: "Пароль...",
    wrongPassword: "Неверный пароль",
    checkingUpdates: "Проверка обновлений…",
    pleaseWait: "Пожалуйста, подождите.",
    error: "Ошибка",
    cannotCheckUpdate: "Не удается проверить обновления.",
    addMessage: "Добавить сообщение...",
    askAboutImage: "Спросить об этом изображении...",
    speakNow: "Говорите сейчас",
    listening: "Слушаю...",
    processing: "Обработка...",
    tapToSpeak: "Нажмите, чтобы говорить",
    stopListening: "Стоп",
  },
  zh: {
    menu: "菜单",
    lightMode: "浅色模式",
    darkMode: "深色模式",
    editProfile: "编辑个人资料 / 头像",
    chatHistory: "聊天记录",
    clearHistory: "清除记录",
    checkUpdates: "检查更新",
    admin: "管理员",
    signOut: "退出",
    upgradeToPro: "升级到 Pro",
    languages: "语言",
    askAnything: "问任何问题...",
    takePhoto: "拍照",
    chooseFromGallery: "从相册选择",
    sharePdf: "分享 PDF",
    voiceChat: "语音聊天",
    send: "发送",
    days: "天",
    lifetimePro: "终身 Pro",
    cancel: "取消",
    enter: "进入",
    password: "密码...",
    wrongPassword: "密码错误",
    checkingUpdates: "检查更新中…",
    pleaseWait: "请稍候。",
    error: "错误",
    cannotCheckUpdate: "无法检查更新。",
    addMessage: "添加消息...",
    askAboutImage: "询问关于这张图片...",
    speakNow: "现在说话",
    listening: "正在听...",
    processing: "处理中...",
    tapToSpeak: "点击说话",
    stopListening: "停止",
  },
  ja: {
    menu: "メニュー",
    lightMode: "ライトモード",
    darkMode: "ダークモード",
    editProfile: "プロフィール編集 / アバター",
    chatHistory: "チャット履歴",
    clearHistory: "履歴を削除",
    checkUpdates: "更新を確認",
    admin: "管理者",
    signOut: "ログアウト",
    upgradeToPro: "Proにアップグレード",
    languages: "言語",
    askAnything: "何でも聞いて...",
    takePhoto: "写真を撮る",
    chooseFromGallery: "ギャラリーから選択",
    sharePdf: "PDFを共有",
    voiceChat: "音声チャット",
    send: "送信",
    days: "日",
    lifetimePro: "ライフタイム Pro",
    cancel: "キャンセル",
    enter: "入る",
    password: "パスワード...",
    wrongPassword: "パスワードが間違っています",
    checkingUpdates: "更新を確認中…",
    pleaseWait: "お待ちください。",
    error: "エラー",
    cannotCheckUpdate: "更新を確認できません。",
    addMessage: "メッセージを追加...",
    askAboutImage: "この画像について質問...",
    speakNow: "今話してください",
    listening: "聞いています...",
    processing: "処理中...",
    tapToSpeak: "タップして話す",
    stopListening: "停止",
  },
  ar: {
    menu: "القائمة",
    lightMode: "الوضع الفاتح",
    darkMode: "الوضع الداكن",
    editProfile: "تعديل الملف / الصورة",
    chatHistory: "سجل المحادثات",
    clearHistory: "مسح السجل",
    checkUpdates: "التحقق من التحديثات",
    admin: "المسؤول",
    signOut: "تسجيل الخروج",
    upgradeToPro: "الترقية إلى Pro",
    languages: "اللغات",
    askAnything: "اسأل أي شيء...",
    takePhoto: "التقاط صورة",
    chooseFromGallery: "اختر من المعرض",
    sharePdf: "مشاركة PDF",
    voiceChat: "الدردشة الصوتية",
    send: "إرسال",
    days: "أيام",
    lifetimePro: "Pro مدى الحياة",
    cancel: "إلغاء",
    enter: "دخول",
    password: "كلمة المرور...",
    wrongPassword: "كلمة مرور خاطئة",
    checkingUpdates: "جاري التحقق من التحديثات…",
    pleaseWait: "يرجى الانتظار.",
    error: "خطأ",
    cannotCheckUpdate: "لا يمكن التحقق من التحديثات.",
    addMessage: "أضف رسالة...",
    askAboutImage: "اسأل عن هذه الصورة...",
    speakNow: "تحدث الآن",
    listening: "أستمع...",
    processing: "جاري المعالجة...",
    tapToSpeak: "انقر للتحدث",
    stopListening: "توقف",
  },
};

export const languageNames: Record<Language, string> = {
  sr: "Srpski",
  en: "English",
  de: "Deutsch",
  fr: "Français",
  es: "Español",
  it: "Italiano",
  ru: "Русский",
  zh: "中文",
  ja: "日本語",
  ar: "العربية",
};

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: Translations;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<Language>(() => {
    const saved = localStorage.getItem("app-language");
    return (saved as Language) || "sr";
  });

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem("app-language", lang);
  };

  useEffect(() => {
    document.documentElement.lang = language;
    document.documentElement.dir = language === "ar" ? "rtl" : "ltr";
  }, [language]);

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t: translations[language] }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }
  return context;
}
