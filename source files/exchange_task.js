"use strict";
// متغیرهای سراسری با نوع‌گذاری TypeScript
// متغیرها بصورت کمل کیس تعریف شده‌اند
const dollarPriceTag = document.querySelector(".dollar-price");
const dollarChangeTag = document.querySelector(".dollar-change");
const dollarPercentTag = document.querySelector(".dollar-percent");
const offlineAlertTag = document.querySelector(".offline-alert");
const faultTag = document.querySelector(".fault");
const exchangeInputTag = document.querySelector(".exchange-input");
// تابع مخصوص درخواست مکرر هر ۳۰ ثانیه به API — این تابع آسنکرون است
async function continuousApi() {
    // یک شی از نوع کنترلر ایجاد کردیم برای کنترل fetch
    const controller = new AbortController();
    // کلیدی که برای api ثبت‌نام رایگان کردم و بهم تحویل داده شد.
    const API_URL = "https://api.brsapi.ir/Market/Gold_Currency.php?key=Bm5jRQvuf5krYA3deBaPZwqTk75zkL8g";
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
        const data = await response.json();
        // در صورت موفقیت‌آمیز بودن، تنظیم CSS
        console.log("داده‌ی API:", data);
        offlineAlertTag.style.visibility = "hidden";
        faultTag.style.visibility = "hidden";
        faultTag.style.position = "absolute";
        exchangeInputTag.style.visibility = "visible";
        exchangeInputTag.style.position = "relative";
        // قیمت دلار
        const dollarPrice = data.currency[1].price * 10;
        // این کد اعداد فونت انگلیسی رو فارسی می‌کند
        const dollarPriceFa = new Intl.NumberFormat("fa-IR").format(dollarPrice);
        // تغییر ۲۴ ساعت گذشته به تومان
        const dollarChange = data.currency[1].change_value;
        const dollarChangeFa = new Intl.NumberFormat("fa-IR").format(dollarChange);
        // تغییر ۲۴ ساعت گذشته به درصد
        const dollarPercent = data.currency[1].change_percent;
        const dollarPercentFa = new Intl.NumberFormat("fa-IR").format(dollarPercent);
        dollarPriceTag.textContent = dollarPriceFa;
        dollarChangeTag.textContent = dollarChangeFa;
        // با توجه به منفی یا مثبت بودن درصد، رنگ سبز یا قرمز در CSS مشخص می‌شود
        if (dollarPercent > 0) {
            dollarPercentTag.style.color = "var(--positive)";
            dollarPercentTag.textContent = "▲" + dollarPercentFa + "%";
        }
        else {
            dollarPercentTag.style.color = "var(--danger)";
            dollarPercentTag.textContent = "▼" + dollarPercentFa + "%";
        }
        // اجرا دوباره تابع بعد ۳۰ ثانیه
        setTimeout(continuousApi, 30000);
        return data.currency[1];
    }
    catch (error) {
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
            }
            else {
                console.log("خطای دیگری رخ داد:", error.message);
            }
        }
        buttonRefresh();
        return 1;
    }
    finally {
        // پاک کردن تایمر
        clearTimeout(timeoutId);
    }
}
// این تابع تنها برای دیباگ و تست API هست و در این برنامه استفاده‌ای نشده
async function apiRequest() {
    const url = "https://api.brsapi.ir/Market/Gold_Currency.php?key=Bm5jRQvuf5krYA3deBaPZwqTk75zkL8g";
    const response = await fetch(url);
    if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
    }
    const json = await response.json();
    return json.currency[1];
}
// تابع تغییر تم دارک و لایت
function buttonTriggerTheme() {
    // خواندن محتوای این دو تگ
    const btnTheme = document.querySelector(".theme-change");
    const icon = document.querySelector(".theme-change i");
    // تریگر شدن تابع در صورت کلیک روی تگ مربوطه
    btnTheme.addEventListener("click", () => {
        // بدنه اصلی CSS رو بین دارک‌تم و حالت عادی تاگل کن
        const isDark = document.body.classList.toggle("dark_theme");
        if (isDark) {
            // این آیکون CSS رو از کتابخونه آسام حذف کن
            icon.classList.remove("fa-lightbulb");
            // این آیکون CSS رو از کتابخونه آسام اضافه کن
            icon.classList.add("fa-moon");
        }
        else {
            icon.classList.remove("fa-moon");
            icon.classList.add("fa-lightbulb");
        }
    });
}
// تابع مربوط به اعمال دکمه تبدیل قیمت ارز
async function buttonPriceChange() {
    // با await، صبر کن تا این تابع درخواست API اجرا بشه
    let apiResult = await continuousApi();
    console.log(apiResult);
    // اگر مقدار برگشتی ۱ بود (خطا)، ادامه نده
    if (apiResult === 1)
        return;
    // تبدیل تومان به ریال
    let dollarPrice = apiResult.price * 10;
    const btnExchange = document.querySelector(".btn-exchange");
    btnExchange.addEventListener("click", () => {
        const firstInputTag = document.querySelector(".first-input input");
        const inVal = firstInputTag.value;
        const secondInputTag = document.querySelector(".second-input input");
        const selectCurrency = document.querySelector(".first-input select");
        const secondInputSelectTag = document.querySelector(".second-input select");
        // چک مقدار تگ selector
        if (selectCurrency.value === "dollar") {
            // اگه دلار بود، سلکتور HTML خروجی رو ریال کن و عدد رو در قیمت واحد ضرب کن
            secondInputTag.value = String(Number(inVal) * dollarPrice);
            secondInputSelectTag.value = "rial";
        }
        else {
            // اگه ریال بود، سلکتور HTML خروجی رو دلار کن و عدد رو بر قیمت واحد تقسیم کن
            secondInputTag.value = String(Number(inVal) / dollarPrice);
            secondInputSelectTag.value = "dollar";
        }
    });
}
// در صورت اعمال این تگ، این تابع رفرش‌کننده صفحه رو اجرا می‌کند — همچنین تابع آسنکرون و تأخیردار هست
async function buttonRefresh() {
    const btnRef = document.querySelector(".fault span");
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
