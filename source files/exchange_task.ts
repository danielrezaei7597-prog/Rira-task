// متغیرهای سراسری با نوع‌گذاری TypeScript
// متغیرها بصورت کمل کیس تعریف شده‌اند

const dollarPriceTag = document.querySelector(".dollar-price") as HTMLElement;
const dollarChangeTag = document.querySelector(".dollar-change") as HTMLElement;
const dollarPercentTag = document.querySelector(".dollar-percent") as HTMLElement;
const offlineAlertTag = document.querySelector(".offline-alert") as HTMLElement;
const faultTag = document.querySelector(".fault") as HTMLElement;
const exchangeInputTag = document.querySelector(".exchange-input") as HTMLElement;


// تایپ‌های مربوط به ساختار پاسخ API
interface CurrencyItem {
  price: number;
  change_value: number;
  change_percent: number;
}

interface ApiResponse {
  currency: CurrencyItem[];
}


// تابع مخصوص درخواست مکرر هر ۳۰ ثانیه به API — این تابع آسنکرون است
async function continuousApi(): Promise<CurrencyItem | 1> {

  // یک شی از نوع کنترلر ایجاد کردیم برای کنترل fetch
  const controller = new AbortController();

  // کلیدی که برای api ثبت‌نام رایگان کردم و بهم تحویل داده شد.
  const API_URL = "https://api.brsapi.ir/Market/Gold_Currency";

  // تایمر برای لغو درخواست بعد از ۱۰ ثانیه
  const timeoutId = setTimeout(() => {
    controller.abort();
  }, 10000);

  try {

    // به این آدرس یک پیام بده و اگه بعد ۱۰ ثانیه جوابی نیومد با کنترلر متوقف شو — همچنان داده‌ها رو از کش نخوان
    const response = await fetch(API_URL, {
      signal: controller.signal,
      cache: "no-store"
    });

    // اگه جوابش اوکی نبود خودمون خطا ایجاد می‌کنیم تا به catch بپرد
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    // صبر می‌کند تا داده بیاد و سپس داده JSON رو به شیء تبدیل می‌کند تا جاوااسکریپت بتونه بعنوان متغیر رفتار کند
    const data: ApiResponse = await response.json();

    // در صورت موفقیت‌آمیز بودن، تنظیم CSS
    console.log("داده‌ی API:", data);
    offlineAlertTag.style.visibility = "hidden";
    faultTag.style.visibility = "hidden";
    faultTag.style.position = "absolute";
    exchangeInputTag.style.visibility = "visible";
    exchangeInputTag.style.position = "relative";

    // قیمت دلار
    const dollarPrice: number = data.currency[1].price * 10;
    // این کد اعداد فونت انگلیسی رو فارسی می‌کند
    const dollarPriceFa: string = new Intl.NumberFormat("fa-IR").format(dollarPrice);

    // تغییر ۲۴ ساعت گذشته به تومان
    const dollarChange: number = data.currency[1].change_value;
    const dollarChangeFa: string = new Intl.NumberFormat("fa-IR").format(dollarChange);

    // تغییر ۲۴ ساعت گذشته به درصد
    const dollarPercent: number = data.currency[1].change_percent;
    const dollarPercentFa: string = new Intl.NumberFormat("fa-IR").format(dollarPercent);

    dollarPriceTag.textContent = dollarPriceFa;
    dollarChangeTag.textContent = dollarChangeFa;

    // با توجه به منفی یا مثبت بودن درصد، رنگ سبز یا قرمز در CSS مشخص می‌شود
    if (dollarPercent > 0) {
      dollarPercentTag.style.color = "var(--positive)";
      dollarPercentTag.textContent = "▲" + dollarPercentFa + "%";
    } else {
      dollarPercentTag.style.color = "var(--danger)";
      dollarPercentTag.textContent = "▼" + dollarPercentFa + "%";
    }

    // اجرا دوباره تابع بعد ۳۰ ثانیه
    setTimeout(continuousApi, 30000);

    return data.currency[1];

  } catch (error: unknown) {

    // تغییر استایل‌ها در CSS اگه خطا داشت درخواست API
    dollarPriceTag.textContent = "--";
    dollarChangeTag.textContent = "--";
    dollarPercentTag.textContent = "--";
    offlineAlertTag.style.visibility = "visible";
    faultTag.style.visibility = "visible";
    faultTag.style.position = "relative";
    exchangeInputTag.style.visibility = "hidden";
    exchangeInputTag.style.position = "absolute";

    // به منظور دیباگ بیشتر در پنجره کنسول مرورگر
    if (error instanceof Error) {
      if (error.name === "AbortError") {
        console.log("درخواست بیشتر از ۱۰ ثانیه طول کشید و لغو شد.");
      } else {
        console.log("خطای دیگری رخ داد:", error.message);
      }
    }

    buttonRefresh();

    return 1;

  } finally {
    // پاک کردن تایمر
    clearTimeout(timeoutId);
  }
}


// این تابع تنها برای دیباگ و تست API هست و در این برنامه استفاده‌ای نشده
async function apiRequest(): Promise<CurrencyItem> {
  const url = "https://api.brsapi.ir/Market/Gold_Currency";

  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(`HTTP ${response.status}`);
  }

  const json: ApiResponse = await response.json();

  return json.currency[1];
}


// تابع تغییر تم دارک و لایت
function buttonTriggerTheme(): void {
  // خواندن محتوای این دو تگ
  const btnTheme = document.querySelector(".theme-change") as HTMLElement;
  const icon = document.querySelector(".theme-change i") as HTMLElement;

  // تریگر شدن تابع در صورت کلیک روی تگ مربوطه
  btnTheme.addEventListener("click", () => {

    // بدنه اصلی CSS رو بین دارک‌تم و حالت عادی تاگل کن
    const isDark: boolean = document.body.classList.toggle("dark_theme");

    if (isDark) {
      // این آیکون CSS رو از کتابخونه آسام حذف کن
      icon.classList.remove("fa-lightbulb");
      // این آیکون CSS رو از کتابخونه آسام اضافه کن
      icon.classList.add("fa-moon");
    } else {
      icon.classList.remove("fa-moon");
      icon.classList.add("fa-lightbulb");
    }
  });
}


// تابع مربوط به اعمال دکمه تبدیل قیمت ارز
async function buttonPriceChange(): Promise<void> {

  // با await، صبر کن تا این تابع درخواست API اجرا بشه
  let apiResult = await continuousApi();
  console.log(apiResult);

  // اگر مقدار برگشتی ۱ بود (خطا)، ادامه نده
  if (apiResult === 1) return;

  // تبدیل تومان به ریال
  let dollarPrice: number = (apiResult as CurrencyItem).price * 10;

  const btnExchange = document.querySelector(".btn-exchange") as HTMLElement;

  btnExchange.addEventListener("click", () => {

    const firstInputTag = document.querySelector(".first-input input") as HTMLInputElement;
    const inVal: string = firstInputTag.value;
    const secondInputTag = document.querySelector(".second-input input") as HTMLInputElement;
    const selectCurrency = document.querySelector(".first-input select") as HTMLSelectElement;
    const secondInputSelectTag = document.querySelector(".second-input select") as HTMLSelectElement;

    // چک مقدار تگ selector
    if (selectCurrency.value === "dollar") {
      // اگه دلار بود، سلکتور HTML خروجی رو ریال کن و عدد رو در قیمت واحد ضرب کن
      secondInputTag.value = String(Number(inVal) * dollarPrice);
      secondInputSelectTag.value = "rial";
    } else {
      // اگه ریال بود، سلکتور HTML خروجی رو دلار کن و عدد رو بر قیمت واحد تقسیم کن
      secondInputTag.value = String(Number(inVal) / dollarPrice);
      secondInputSelectTag.value = "dollar";
    }
  });
}


// در صورت اعمال این تگ، این تابع رفرش‌کننده صفحه رو اجرا می‌کند — همچنین تابع آسنکرون و تأخیردار هست
async function buttonRefresh(): Promise<void> {

  const btnRef = document.querySelector(".fault span") as HTMLElement;

  btnRef.addEventListener("click", () => {
    // تگ رفرش و تبدیل ارز هر دو محو می‌شوند تا یا تگ رفرش ظاهر شود یا تگ تبدیل ارز در صورت اتصال موفق به API
    setTimeout(buttonPriceChange, 3000);
    offlineAlertTag.style.visibility = "hidden";
    faultTag.style.position = "absolute";
    faultTag.style.visibility = "hidden";
    exchangeInputTag.style.position = "absolute";
    exchangeInputTag.style.visibility = "hidden";
  });
}


// اجرای اولیه
setTimeout(continuousApi, 4000);
setTimeout(buttonPriceChange, 4000);
buttonTriggerTheme();
