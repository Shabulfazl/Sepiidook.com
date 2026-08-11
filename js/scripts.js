/**
 * ========================================================================
 * Main JavaScript File (Refactored & Optimized HomePage)
 * ========================================================================
 */

$(function () {
    "use strict";

// =========================================
// 1. UTILITIES & GLOBAL EVENTS
// =========================================

// جلوگیری از رفتار پیش‌فرض لینک‌های تستی
    const demoLinks = '.login-btn, .cart-btn, .nav-item-custom, .cat-item, .section-link, .product-card a, .special-card a, .cart-empty-link, .cart-view-btn, .cart-checkout-btn, .hero-btn, .dropdown-link, .about-badge, .about-link';
    $(document).on('click', demoLinks, function (e) {
        if ($(this).attr('href') === '#') e.preventDefault();
    });

// استایل‌دهی به فوکوس جستجو (دسکتاپ)
    $('.search-wrap input').on('focus blur', function (e) {
        if (e.type === 'focus') {
            $(this).css({'border-color': 'var(--color-secondary)', 'box-shadow': 'var(--shadow-focus)'});
        } else {
            $(this).css({'border-color': 'var(--color-border)', 'box-shadow': 'none'});
        }
    });

// لود تنبل (Lazy Loading) برای آیکون‌ها
    if ('IntersectionObserver' in window) {
        const lazyImages = document.querySelectorAll('.cat-icon[data-src]');
        const imageObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const img = entry.target;
                    img.src = img.dataset.src;
                    img.removeAttribute('data-src');
                    imageObserver.unobserve(img);
                }
            });
        });
        lazyImages.forEach(img => imageObserver.observe(img));
    }


// =========================================
// 2. SHARED UI INTERACTIONS (Merged Duplicates)
// =========================================

// دکمه‌های علاقه‌مندی (ترکیب محصولات، ویژه و گرید)
    $(document).on('click', '.btn-wishlist, .btn-special-wishlist, .grid-btn-wishlist', function (e) {
        e.preventDefault();
        e.stopPropagation();
        const $btn = $(this);
        const $icon = $btn.find('i');

        $btn.toggleClass('liked');
        if ($btn.hasClass('liked')) {
            $icon.removeClass('fa-regular').addClass('fa-solid');
        } else {
            $icon.removeClass('fa-solid').addClass('fa-regular');
        }
    });

// فیدبک افزوده شدن به سبد خرید (ترکیب محصولات، ویژه و گرید)
    $(document).on('click', '.btn-add-cart:not(:disabled), .btn-special-cart:not(:disabled), .grid-btn-cart', function (e) {
        e.preventDefault();
        const $btn = $(this);
        const originalText = $btn.html();

        $btn.html('<i class="fa-solid fa-check"></i> افزوده شد').css('background', 'var(--color-accent)');
        setTimeout(() => {
            $btn.html(originalText).css('background', '');
        }, 1500);
    });


// =========================================
// 3. SEARCH DROPDOWN & MOBILE FULLSCREEN
// =========================================
    (function initSearch() {
        const $searchWrap = $('#searchWrap');

        // شرط کلیدی: اگر سرچ باکس در این صفحه وجود ندارد، کدهای جستجو را متوقف کن
        if ($searchWrap.length === 0) return;

        const $searchInput = $('#searchInput');
        const $searchDropdown = $('#searchDropdown');
        const $recentContainer = $('#recentTagsContainer');
        const STORAGE_KEY = 'recentSearches';
        const MAX_RECENT = 5;

        // Create elements
        const $backdrop = $('<div class="search-backdrop"></div>').appendTo('body');
        const $overlay = $('<div class="search-overlay"></div>').appendTo('body');

        const $backBtn = $('<button type="button" class="search-back-btn" aria-label="بستن جستجو"><i class="fa-solid fa-arrow-right"></i></button>');
        $searchWrap.find('.search-input-wrapper').prepend($backBtn);

        const isMobile = () => window.innerWidth <= 768;

        // Desktop Search
        function loadRecentSearches() {
            let recent = JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
            $recentContainer.empty();
            recent.forEach(query => {
                const $tag = $(`<button type="button" class="search-tag" data-query="${query}"><i class="fa-solid fa-xmark remove-tag"></i> ${query}</button>`);
                $recentContainer.append($tag);
            });
            $('#recentSearchSection').toggle(recent.length > 0);
        }

        function addRecentSearch(query) {
            if (!query || !query.trim()) return;
            query = query.trim();
            let recent = JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
            recent = recent.filter(q => q !== query);
            recent.unshift(query);
            if (recent.length > MAX_RECENT) recent = recent.slice(0, MAX_RECENT);
            localStorage.setItem(STORAGE_KEY, JSON.stringify(recent));
            loadRecentSearches();
        }

        function performSearch(query) {
            if (!query) return;
            addRecentSearch(query);
            closeSearch();
            $searchInput.val(query);
        }

        // Mobile Fullscreen Search
        function openSearch() {
            loadRecentSearches();
            $searchWrap.addClass('active');
            $searchDropdown.show();

            if (isMobile()) {
                $searchWrap.addClass('mobile-fullscreen');
                $overlay.addClass('active').show();
                $('body').addClass('search-fullscreen-open');
                setTimeout(() => $searchInput.focus(), 100);
            } else {
                $backdrop.addClass('active');
                $('body').css('overflow', 'hidden');
            }
        }

        function closeSearch() {
            $searchWrap.removeClass('active mobile-fullscreen');
            $backdrop.removeClass('active');
            $overlay.removeClass('active').hide();
            $('body').removeClass('search-fullscreen-open').css('overflow', '');
            $searchDropdown.css('display', '');
            $searchInput.blur();
        }

        // Search Events
        $searchInput.on('focus click', function (e) {
            if (e.type === 'click' && !isMobile()) return;
            if (!$searchWrap.hasClass('active') || (isMobile() && !$searchWrap.hasClass('mobile-fullscreen'))) openSearch();
        });

        $searchInput.on('keydown', function (e) {
            if (e.key === 'Enter' && $(this).val().trim()) performSearch($(this).val());
        });

        $('#clearRecentBtn').on('click', e => {
            e.stopPropagation();
            localStorage.removeItem(STORAGE_KEY);
            loadRecentSearches();
        });

        $(document).on('click', '.search-tag', function (e) {
            e.preventDefault();
            e.stopPropagation();
            performSearch($(this).data('query') || $(this).text().trim());
        });

        $backBtn.on('click', closeSearch);
        $backdrop.add($overlay).on('click', e => {
            e.preventDefault();
            e.stopPropagation();
            closeSearch();
        });
        $(document).on('keydown', e => {
            if (e.key === 'Escape') closeSearch();
        });

        let resizeTimer;
        $(window).on('resize', () => {
            clearTimeout(resizeTimer);
            resizeTimer = setTimeout(() => {
                if (!isMobile() && $searchWrap.hasClass('mobile-fullscreen')) closeSearch();
            }, 150);
        });

        loadRecentSearches();
    })();


// =========================================
// 4. DROPDOWNS & MENUS (Mega, User, Cart)
// =========================================

    // -- Mega Menu --
    const megaSwiper = new Swiper('.mega-swiper', {
        slidesPerView: 'auto',
        spaceBetween: 8,
        freeMode: {enabled: true, momentumRatio: 0.8},
        grabCursor: true,
        scrollbar: {el: '.mega-scrollbar', draggable: true},
        breakpoints: {480: {spaceBetween: 8}, 768: {spaceBetween: 10}, 1024: {spaceBetween: 12}}
    });

    $('#megaTrigger').on('click', function (e) {
        e.preventDefault();
        e.stopPropagation();
        const $menu = $('#megaMenu');
        const isActive = $menu.hasClass('active');

        $menu.toggleClass('active', !isActive);
        $(this).toggleClass('active', !isActive);

        if (!isActive) {
            setTimeout(() => megaSwiper.update(), 150);
            if (window.innerWidth <= 768) {
                if (!$('.mega-overlay').length) $('<div class="mega-overlay active"></div>').appendTo('body');
                else $('.mega-overlay').addClass('active');
            }
        } else {
            $('.mega-overlay').removeClass('active').fadeOut(400, function () {
                $(this).remove()
            });
        }
    });

    $('#megaClose, .mega-overlay').on('click', () => $('#megaTrigger').trigger('click'));

    // -- User Dropdown --
    let isLoggedIn = false;
    window.userDropdown = {
        login: (userData) => {
            isLoggedIn = true; /* Update UI Logic here */
        },
        logout: () => {
            isLoggedIn = false;
        },
        isLoggedIn: () => isLoggedIn
    };

    $('#userTrigger, #userTriggerLogged').on('click', function (e) {
        e.preventDefault();
        e.stopPropagation();
        if ($(this).attr('id') === 'userTrigger') isLoggedIn = true; // Demo toggle
        $('#userDropdown, #userTrigger, #userTriggerLogged').toggleClass('active');
    });


    // -- Cart Dropdown
    $(function () {
        // =========================================
        // DOM Elements & Initial Checks
        // =========================================
        const $trigger = $('#cartTrigger');
        // Guard Clause: اگر المان تریگر در این صفحه نیست، ادامه کدها اجرا نشود
        if ($trigger.length === 0) return;

        const $dropdown = $('#cartDropdown');
        const $itemsList = $('#cartItemsList');
        const $emptyState = $('#cartEmpty');
        const $footer = $('#cartFooter');
        const $badge = $('#cartBadge');
        const $totalPrice = $trigger.find('.cart-total-price');
        const $subtotal = $('#cartSubtotal');
        const $itemCount = $('#cartItemCount');

        let cart = {items: [], total: 0, count: 0};

        // =========================================
        // Dropdown Toggle Logic
        // =========================================
        $trigger.on('click', function (e) {
            e.preventDefault();
            $('#cartDropdown, #cartTrigger').toggleClass('active');
        });

        $dropdown.on('click', function (e) {
            e.stopPropagation();
        });

        $(document).on('click', function (e) {
            if (!$(e.target).closest('#cartDropdown, #cartTrigger').length) {
                $('#cartDropdown, #cartTrigger').removeClass('active');
            }
        });

        // =========================================
        // Event Listeners for Cart Actions
        // =========================================
        $itemsList.on('click', '.cart-item-qty-btn', function (e) {
            e.preventDefault();
            const id = $(this).data('id');
            const action = $(this).data('action');
            updateQuantity(id, action === 'increase' ? 1 : -1);
        });

        $itemsList.on('click', '.cart-item-remove', function (e) {
            e.preventDefault();
            const id = $(this).data('id');
            removeFromCart(id);
        });

        // اضافه کردن محصول به سبد با خواندن اطلاعات از روی HTML
        $(document).off('click', '.btn-add-cart, .btn-special-cart').on('click', '.btn-add-cart, .btn-special-cart', function (e) {
            e.preventDefault();

            const $btn = $(this);
            // پیدا کردن کارتِ دربرگیرنده (چه معمولی چه شگفت‌انگیز)
            const $card = $btn.closest('.product-card, .special-card');
            const id = $btn.data('id');

            let name, image, priceText;

            // بررسی نوع کارت برای خواندن کلاس‌های صحیح
            if ($card.hasClass('special-card')) {
                name = $card.find('.special-title-text').text().trim();
                image = $card.find('.special-image img').attr('src');
                // در محصولات تخفیف‌دار، قیمت فعلی (current-price) را می‌گیریم
                priceText = $card.find('.current-price').text();
            } else {
                name = $card.find('.product-title').text().trim();
                image = $card.find('.product-image img').attr('src');
                priceText = $card.find('.product-price').text();
            }

            // تبدیل اعداد فارسی به انگلیسی
            const persianNumbers = [/۰/g, /۱/g, /۲/g, /۳/g, /۴/g, /۵/g, /۶/g, /۷/g, /۸/g, /۹/g];
            let englishPriceText = priceText;
            for (let i = 0; i < 10; i++) {
                englishPriceText = englishPriceText.replace(persianNumbers[i], i);
            }

            // حذف تمام حروف، کاماها و فاصله‌ها برای استخراج عدد خالص قیمت
            const price = parseInt(englishPriceText.replace(/[^0-9]/g, ''), 10);

            const productData = {
                id: id,
                name: name,
                price: price,
                image: image
            };

            if (typeof window.addToCart === 'function') {
                window.addToCart(productData, 1);
            }
        });

        // =========================================
        // Cart Functions
        // =========================================
        // تابع دریافت مستقیم آبجکت اطلاعات محصول به جای آیدی
        window.addToCart = function (productData, quantity = 1) {
            if (!productData || !productData.id) return;

            const existingItem = cart.items.find(item => item.id === productData.id);
            if (existingItem) {
                existingItem.quantity += quantity;
            } else {
                cart.items.push({
                    id: productData.id,
                    name: productData.name,
                    price: productData.price,
                    image: productData.image,
                    quantity: quantity
                });
            }

            updateCart();
            saveCart();
            showNotification('محصول به سبد خرید اضافه شد');
        };

        function removeFromCart(productId) {
            const index = cart.items.findIndex(item => item.id === productId);
            if (index !== -1) {
                cart.items.splice(index, 1);
                updateCart();
                saveCart();
                showNotification('محصول از سبد خرید حذف شد');
            }
        }

        function updateQuantity(productId, delta) {
            const item = cart.items.find(item => item.id === productId);
            if (!item) return;

            const newQuantity = item.quantity + delta;
            if (newQuantity <= 0) {
                removeFromCart(productId);
                return;
            }

            item.quantity = newQuantity;
            updateCart();
            saveCart();
        }

        function calculateTotals() {
            cart.count = cart.items.reduce((sum, item) => sum + item.quantity, 0);
            cart.total = cart.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        }

        function updateCart() {
            calculateTotals();

            if (cart.count > 0) {
                $badge.text(cart.count).removeClass('hidden');
            } else {
                $badge.addClass('hidden');
            }

            if ($totalPrice.length) $totalPrice.text(formatPrice(cart.total));
            if ($subtotal.length) $subtotal.text(formatPrice(cart.total));
            if ($itemCount.length) $itemCount.text(cart.count + ' آیتم');

            renderItems();

            if (cart.items.length === 0) {
                $emptyState.addClass('show');
                $itemsList.hide();
                $footer.hide();
            } else {
                $emptyState.removeClass('show');
                $itemsList.show();
                $footer.show();
            }
        }

        function renderItems() {
            if (cart.items.length === 0) {
                $itemsList.html('');
                return;
            }

            let html = '';
            cart.items.forEach(item => {
                html += `
        <div class="cart-item" data-id="${item.id}">
            <div class="cart-item-image">
                <img src="${item.image}" alt="${item.name}" onerror="this.style.display='none'">
            </div>
            <div class="cart-item-info">
                <div class="cart-item-name">${item.name}</div>
                <div class="cart-item-price">${formatPrice(item.price)}</div>
                <div class="cart-item-actions">
                    <button class="cart-item-qty-btn" data-action="decrease" data-id="${item.id}">−</button>
                    <span class="cart-item-qty">${item.quantity}</span>
                    <button class="cart-item-qty-btn" data-action="increase" data-id="${item.id}">+</button>
                </div>
            </div>
            <button class="cart-item-remove" data-id="${item.id}">
                <i class="fa-regular fa-trash-can"></i>
            </button>
        </div>
        `;
            });

            $itemsList.html(html);
        }

        // =========================================
        // Helper Functions
        // =========================================
        function formatPrice(price) {
            // مدیریت حالت‌هایی که قیمت نامعتبر است (مثلاً NaN)
            if (!price || isNaN(price)) return '0 تومان';
            return price.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',') + ' تومان';
        }

        function saveCart() {
            try {
                localStorage.setItem('cart', JSON.stringify(cart.items));
            } catch (e) {
                // ignore
            }
        }

        function loadCart() {
            try {
                const data = localStorage.getItem('cart');
                if (data) {
                    cart.items = JSON.parse(data);
                    updateCart();
                }
            } catch (e) {
                // ignore
            }
        }

        function showNotification(message) {
            const $notification = $(`
        <div class="cart-notification">
            <i class="fa-regular fa-check-circle"></i>
            <span>${message}</span>
        </div>
    `);

            $notification.css({
                position: 'fixed',
                bottom: '20px',
                right: '20px',
                background: '#65d47d',
                color: '#fff',
                padding: '12px 24px',
                borderRadius: '12px',
                fontFamily: 'Vazirmatn, sans-serif',
                fontSize: '14px',
                fontWeight: '500',
                boxShadow: '0 8px 25px rgba(0,0,0,0.15)',
                zIndex: '9999',
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                transform: 'translateY(100px)',
                opacity: '0',
                transition: 'all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)'
            });

            $('body').append($notification);

            setTimeout(() => $notification.css({transform: 'translateY(0)', opacity: '1'}), 50);

            setTimeout(() => {
                $notification.css({transform: 'translateY(100px)', opacity: '0'});
                setTimeout(() => $notification.remove(), 400);
            }, 2500);
        }

        // Initialize
        loadCart();
    });


    // Close Dropdowns on outside click
    $(document).on('click', function (e) {
        if (!$(e.target).closest('.nav-item-mega').length) $('#megaMenu, #megaTrigger').removeClass('active');
        if (!$(e.target).closest('.user-dropdown-wrapper').length) $('#userDropdown, #userTrigger, #userTriggerLogged').removeClass('active');
        if (!$(e.target).closest('.cart-wrap').length) $('#cartDropdown, #cartTrigger').removeClass('active');
    });

    $(document).ready(function () {
        // باز کردن مگا-منو وقتی روی دکمه دسته‌ها کلیک/انتخاب می‌شود
        $('#nav-categories').on('change', function () {
            if ($(this).is(':checked')) {
                $('#megaMenu').addClass('active'); // باز شدن منو
                $('body').css('overflow', 'hidden'); // جلوگیری از اسکرول صفحه
            }
        });

        // بستن مگا-منو وقتی روی سایر دکمه‌های نوبار پایین کلیک می‌شود
        $('input[name="mobileNav"]').not('#nav-categories').on('change', function () {
            $('#megaMenu').removeClass('active'); // بستن منو
            $('body').css('overflow', ''); // برگرداندن اسکرول صفحه
        });

        // دکمه ضربدر داخل خود مگا-منو برای بستن آن
        $('.mega-close').on('click', function (e) {
            e.preventDefault();
            $('#megaMenu').removeClass('active');
            $('body').css('overflow', '');

            // برداشتن تیک دکمه دسته‌ها (می‌توانید تیک دکمه "خانه" را اینجا فعال کنید)
            $('#nav-categories').prop('checked', false);
        });
    });


// =========================================
// 5. SWIPERS & SLIDERS
// =========================================

// Slider configuration factory
    const createFreeModeSwiper = (selector, defaultSpace, breakpoints) => {
        if ($(selector).length) {
            return new Swiper(selector, {
                slidesPerView: 'auto',
                spaceBetween: defaultSpace,
                freeMode: {enabled: true, momentumRatio: 0.8},
                grabCursor: true,
                breakpoints: breakpoints
            });
        }
    };

// Products & Special Offers
    createFreeModeSwiper('.product-swiper', 18, {
        0: {spaceBetween: 12},
        576: {slidesPerView: 2.2},
        768: {slidesPerView: 3.2},
        992: {slidesPerView: 4.8}
    });
    createFreeModeSwiper('.special-swiper', 20, {
        0: {spaceBetween: 12},
        576: {slidesPerView: 2.2},
        768: {slidesPerView: 3.2},
        992: {slidesPerView: 4.8}
    });

// Blog Swiper
if ($('.blog-swiper').length) {
    new Swiper('.blog-swiper', {
        slidesPerView: 1.2, /* در موبایل یک کارت و 20 درصد از کارت بعدی دیده شود */
        spaceBetween: 15,
        freeMode: {enabled: true, momentumRatio: 0.8},
        scrollbar: {
            el: '.blog-swiper .swiper-scrollbar',
            hide: false,
        },
        navigation: {
            nextEl: '.blog-nav-next',
            prevEl: '.blog-nav-prev',
        },
        breakpoints: {
            480: {
                slidesPerView: 1.5,
                spaceBetween: 15
            },
            768: {
                slidesPerView: 2,
                spaceBetween: 20
            },
            992: {
                slidesPerView: 2.5,
                spaceBetween: 25
            }
        }
    });
}

// Category Grid Swiper (2 Rows)
    if ($('.cat-swiper').length) {
        new Swiper('.cat-swiper', {
            slidesPerView: 2.5, /* عدد اعشاری برای مشخص بودن قابلیت اسکرول در موبایل */
            spaceBetween: 15,
            grabCursor: true,
            freeMode: true, /* اضافه شدن Free Mode */
            grid: {
                rows: 2,
                fill: 'row'
            },
            pagination: {
                el: '.cat-swiper .swiper-pagination',
                clickable: true
            },
            breakpoints: {
                576: {slidesPerView: 5.5, spaceBetween: 15},
                768: {slidesPerView: 4.5, spaceBetween: 20},
                992: {slidesPerView: 5.5, spaceBetween: 20},
                1200: {slidesPerView: 6.5, spaceBetween: 25}
            }
        });
    }

// =========================================
// 6. COMPONENTS (Hero Carousel, Tabs, Accordion, Countdown)
// =========================================

// -- Hero Carousel Progress --
    const $carousel = $('#heroCarousel');
    if ($carousel.length) {
        const $progressTrack = $('.hero-progress-track');
        const intervalTime = 5000;

        const startProgress = () => {
            $progressTrack.css({width: '0%', transition: 'none'});
            setTimeout(() => $progressTrack.css({width: '100%', transition: `width ${intervalTime}ms linear`}), 50);
        };
        const pauseProgress = () => $progressTrack.css({
            width: ($progressTrack.width() / $progressTrack.parent().width()) * 100 + '%',
            transition: 'none'
        });

        $carousel.on('slide.bs.carousel', () => {
            $progressTrack.css({width: '0%', transition: 'none'});
            setTimeout(startProgress, 100);
        });
        $carousel.hover(pauseProgress, () => {
            const percentage = ($progressTrack.width() / $progressTrack.parent().width()) * 100;
            $progressTrack.css({
                width: '100%',
                transition: `width ${((100 - percentage) / 100) * intervalTime}ms linear`
            });
        });

        setTimeout(startProgress, 300);
    }

// -- Tabs --
    $('.tab-btn').on('click', function () {
        $('.tab-btn, .tab-panel').removeClass('active');
        $(this).addClass('active');
        $('#tab-' + $(this).data('tab')).addClass('active');
    });

// -- About Content Toggle (مشاهده بیشتر) --
    const $aboutToggleBtn = $('#aboutToggleBtn');

    // Guard Clause: اگر دکمه در صفحه نیست، کدهای این بخش اجرا نشود
    if ($aboutToggleBtn.length > 0) {
        $aboutToggleBtn.on('click', function (e) {
            e.preventDefault();
            const $moreContent = $('#aboutMore');
            const $text = $(this).find('.toggle-text');
            const $icon = $(this).find('.toggle-icon');

            // باز و بسته کردن محتوا با انیمیشن
            $moreContent.slideToggle(300, function () {
                // بعد از اتمام انیمیشن، متن و آیکون دکمه را تغییر می‌دهیم
                if ($moreContent.is(':visible')) {
                    $text.text('بستن');
                    $icon.removeClass('fa-chevron-down').addClass('fa-chevron-up');
                    $('.about-why-preview').css("position", 'static')
                } else {
                    $text.text('مشاهده بیشتر');
                    $icon.removeClass('fa-chevron-up').addClass('fa-chevron-down');
                }
            });
        });
    }

// -- FAQ Accordion (سوالات متداول) --
    const $faqWrapper = $('.about-faq-wrapper');

    // Guard Clause
    if ($faqWrapper.length > 0) {
        // ابتدا محتوای آکاردئون‌هایی که کلاس active ندارند را مخفی می‌کنیم
        $('.accordion-content:not(.active)').hide();

        $faqWrapper.on('click', '.accordion-btn', function (e) {
            e.preventDefault();
            const $btn = $(this);
            const targetId = $btn.data('target');
            const $targetContent = $('#' + targetId);

            // اگر روی آکاردئونی کلیک شد که خودش از قبل باز بود، آن را می‌بندیم
            if ($btn.hasClass('active')) {
                $btn.removeClass('active');
                $targetContent.slideUp(300).removeClass('active');
            } else {
                // اگر روی آکاردئون جدیدی کلیک شد:
                // الف) بقیه را می‌بندیم
                $faqWrapper.find('.accordion-btn.active').removeClass('active');
                $faqWrapper.find('.accordion-content.active').slideUp(300).removeClass('active');

                // ب) همین آکاردئون را باز می‌کنیم
                $btn.addClass('active');
                $targetContent.slideDown(300).addClass('active');
            }
        });
    }

// -- Countdown Timer --
    if ($('#hours').length) {
        let totalSeconds = 16 * 3600 + 45 * 60 + 30; // 16:45:30
        setInterval(() => {
            if (totalSeconds <= 0) return;
            totalSeconds--;
            $('#hours').text(String(Math.floor(totalSeconds / 3600)).padStart(2, '0'));
            $('#minutes').text(String(Math.floor((totalSeconds % 3600) / 60)).padStart(2, '0'));
            $('#seconds').text(String(totalSeconds % 60).padStart(2, '0'));
        }, 1000);
    }

});


/**
 * ========================================================================
 * Pages JavaScript (Auth, Dashboard, Shop, Product) - Refactored
 * ========================================================================
 */
$(function () {
    "use strict";

    // =========================================
    // 1. GLOBAL UTILITIES (Shared Functions)
    // =========================================

    // سیستم نوتیفیکیشن یکپارچه
    window.showNotification = function (message, type = 'success') {
        $('.cart-notification').remove();

        let bgColor = '#65d47d'; // success
        if (type === 'error' || message.includes('❌') || message.includes('اشتباه') || message.includes('حذف') || message.includes('🗑️')) {
            bgColor = '#ff6b6b';
        } else if (message.includes('❤️')) {
            bgColor = '#ff6b6b';
        }

        const $notification = $(`
            <div class="cart-notification" style="position:fixed;bottom:20px;right:20px;background:${bgColor};color:#fff;padding:12px 24px;border-radius:12px;font-family:'Vazirmatn', sans-serif;font-size:14px;font-weight:500;box-shadow:0 8px 25px rgba(0,0,0,0.15);z-index:9999;display:flex;align-items:center;gap:10px;transform:translateY(100px);opacity:0;transition:all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);max-width:400px;">
                <i class="fa-regular fa-check-circle"></i>
                <span>${message}</span>
            </div>
        `).appendTo('body');

        setTimeout(() => $notification.css({transform: 'translateY(0)', opacity: '1'}), 50);
        setTimeout(() => {
            $notification.css({transform: 'translateY(100px)', opacity: '0'});
            setTimeout(() => $notification.remove(), 400);
        }, 3000);
    };

    // سایدبار موبایل یکپارچه (پنل کاربری و فروشگاه)
    const toggleSidebar = ($sidebar, $overlay, action) => {
        if (action === 'open') {
            $sidebar.addClass('open');
            if ($overlay.length) $overlay.addClass('active');
            $('body').css('overflow', 'hidden');
        } else {
            $sidebar.removeClass('open');
            if ($overlay.length) $overlay.removeClass('active');
            $('body').css('overflow', '');
        }
    };

    // رویدادهای سایدبار پنل کاربری
    $('#mobileMenuToggle').on('click', e => {
        e.preventDefault();
        toggleSidebar($('#mobileSidebar'), $('#mobileSidebarOverlay'), 'open');
    });
    $('#mobileMenuClose, #mobileSidebarOverlay').on('click', () => toggleSidebar($('#mobileSidebar'), $('#mobileSidebarOverlay'), 'close'));

    // رویدادهای سایدبار فیلتر فروشگاه
    $('#mobileFilterToggle').on('click', function () {
        $('.shop-sidebar').addClass('open');
        if (!$('.sidebar-overlay').length) $('body').append('<div class="sidebar-overlay active"></div>');
        $('body').css('overflow', 'hidden');
    });
    $(document).on('click', '.sidebar-overlay, .clear-filters-btn', function () {
        if ($(window).width() < 992) {
            $('.shop-sidebar').removeClass('open');
            $('.sidebar-overlay').remove();
            $('body').css('overflow', '');
        }
    });

    $(document).on('keydown', e => {
        if (e.key === 'Escape') {
            toggleSidebar($('#mobileSidebar'), $('#mobileSidebarOverlay'), 'close');
            $('.shop-sidebar').removeClass('open');
            $('.sidebar-overlay').remove();
        }
    });

    // تایمر عمومی OTP
    const startOtpTimer = (seconds, $timerEl, $resendBtn, onEnd) => {
        let timeLeft = seconds;
        $timerEl.text(timeLeft > 30 ? timeLeft : `00:${timeLeft < 10 ? '0' : ''}${timeLeft}`).removeClass('expired');
        if ($resendBtn) $resendBtn.prop('disabled', true);

        const interval = setInterval(() => {
            timeLeft--;
            $timerEl.text(timeLeft > 30 ? timeLeft : `00:${timeLeft < 10 ? '0' : ''}${timeLeft}`);
            if (timeLeft <= 0) {
                clearInterval(interval);
                $timerEl.addClass('expired').text(timeLeft > 30 ? '0' : '۰۰:۰۰');
                if ($resendBtn) $resendBtn.prop('disabled', false);
                if (onEnd) onEnd();
            }
        }, 1000);
        return interval;
    };


    // =========================================
    // 2. AUTHENTICATION (Login / Register)
    // =========================================
    if ($('#stepPhone').length) {
        let phoneNumber = '', otpCode = '12345', timerInterval = null;

        $('#phoneInput').on('input', function () {
            this.value = this.value.replace(/[^0-9]/g, '').slice(0, 9);
            $('#sendOtpBtn').prop('disabled', this.value.length !== 9);
        }).on('keydown', function (e) {
            if (e.key === 'Enter' && this.value.length === 9) $('#sendOtpBtn').click();
        });

        $('#sendOtpBtn').on('click', function (e) {
            e.preventDefault();
            if ($('#phoneInput').val().length !== 9) return showNotification('❌ شماره تلفن باید ۹ رقم باشد', 'error');

            phoneNumber = '09' + $('#phoneInput').val();
            $('#otpPhoneDisplay').text(phoneNumber);

            $('#stepPhone').hide();
            $('#stepOtp').fadeIn();
            $('.otp-input').val('').removeClass('filled error').first().focus();

            if (timerInterval) clearInterval(timerInterval);
            timerInterval = startOtpTimer(60, $('#otpTimer'), $('#verifyOtpBtn'), () => $('#verifyOtpBtn').prop('disabled', true));
            showNotification('✅ کد تایید برای شما ارسال شد');
        });

        // OTP Inputs Handling
        $('.otp-input').on('input', function () {
            this.value = this.value.replace(/[^0-9]/g, '').slice(0, 1);
            if (this.value) {
                $(this).addClass('filled').next('.otp-input').focus();
                checkOtpComplete();
            } else {
                $(this).removeClass('filled');
            }
        }).on('keydown', function (e) {
            if (e.key === 'Backspace' && !this.value) $(this).prev('.otp-input').focus().val('').removeClass('filled');
            if (e.key === 'Enter') checkOtpComplete(true);
        }).first().on('paste', function (e) {
            e.preventDefault();
            const digits = (e.originalEvent.clipboardData || window.clipboardData).getData('text').replace(/[^0-9]/g, '').slice(0, 5);
            $('.otp-input').each((i, el) => {
                if (i < digits.length) $(el).val(digits[i]).addClass('filled');
            });
            $('.otp-input').eq(Math.min(digits.length, 5) - 1).focus();
            checkOtpComplete();
        });

        function checkOtpComplete(force = false) {
            let otp = $('.otp-input').map((_, el) => el.value).get().join('');
            if (otp.length === 5 || force) verifyOtp(otp);
        }

        function verifyOtp(otp) {
            if ($('#verifyOtpBtn').prop('disabled')) return;
            if (otp === otpCode) {
                $('.otp-input').removeClass('error');
                $('#verifyOtpBtn').prop('disabled', true);
                showNotification('✅ خوش آمدید، در حال ورود...');
                setTimeout(() => {
                    $('#stepOtp').hide();
                    $('#stepRegister').fadeIn();
                    $('#registerPhone').val(phoneNumber);
                    $('#registerName').focus();
                }, 1500);
            } else {
                $('.otp-input').addClass('error');
                showNotification('❌ کد وارد شده اشتباه است', 'error');
                setTimeout(() => $('.otp-input').removeClass('error').val('').removeClass('filled').first().focus(), 1000);
            }
        }

        $('#verifyOtpBtn').on('click', () => checkOtpComplete(true));
        $('#backToPhoneBtn').on('click', () => {
            clearInterval(timerInterval);
            $('#stepOtp').hide();
            $('#stepPhone').fadeIn();
            $('#phoneInput').focus();
        });

        $('#registerBtn').on('click', () => {
            if ($('#registerName').val().trim().length < 2) return showNotification('❌ لطفاً نام خود را وارد کنید', 'error');
            showNotification('✅ ثبت‌نام شما با موفقیت انجام شد');
            setTimeout(() => window.location.href = '/', 1500);
        });
        $('#registerName').on('keydown', e => {
            if (e.key === 'Enter') $('#registerBtn').click();
        });

        setTimeout(() => $('#phoneInput').focus(), 300);
    }


    // =========================================
    // 3. USER DASHBOARD & ACCOUNT PAGES
    // =========================================

    // منوی فعال داشبورد
    $('.dashboard-menu li a').on('click', function (e) {
        if ($(this).attr('href') === '#') e.preventDefault();
        $('.dashboard-menu li').removeClass('active');
        $(this).closest('li').addClass('active');
        if ($(window).width() < 992) toggleSidebar($('#mobileSidebar'), $('#mobileSidebarOverlay'), 'close');
    });

    // دکمه‌های دمو داشبورد
    $('.user-edit-btn').on('click', e => {
        e.preventDefault();
        showNotification('✏️ ویرایش اطلاعات کاربری');
    });
    $('.add-address-btn').on('click', e => {
        if ($(this).attr('href') === '#') e.preventDefault();
        showNotification('➕ افزودن آدرس جدید');
    });
    $('.dashboard-table tbody tr').on('click', () => showNotification('📦 مشاهده جزئیات سفارش'));
    $('.dashboard-menu li.logout a').on('click', e => {
        if ($(this).attr('href') === '#') e.preventDefault();
        showNotification('🚪 خروج از حساب کاربری');
    });

    // فیلتر سفارشات
    $('.filter-tab').on('click', function () {
        $('.filter-tab').removeClass('active');
        $(this).addClass('active');
        const filter = $(this).data('filter');
        $('.order-item').each(function () {
            $(this).toggle(filter === 'all' || $(this).data('status') === filter);
        });
    });
    $('.toggle-products-btn').on('click', function () {
        const $products = $(this).closest('.order-body').find('.order-products').toggleClass('expanded');
        $(this).toggleClass('active').find('.toggle-text').text($products.hasClass('expanded') ? 'مشاهده کمتر' : 'نمایش همه محصولات');
    });
    $('.btn-invoice').on('click', function () {
        showNotification('📄 در حال نمایش فاکتور سفارش ' + $(this).data('order'));
    });

    // علاقه‌مندی‌ها
    const checkWishlistEmpty = () => {
        const count = $('.wishlist-item').length;
        $('#wishlistCount').text(`${count} محصول`);
        $('#wishlistGrid').toggle(count > 0);
        $('#wishlistEmpty').toggle(count === 0);
    };
    $('.wishlist-remove').on('click', function (e) {
        e.preventDefault();
        e.stopPropagation();
        const $item = $(this).closest('.wishlist-item');
        $item.css({transform: 'scale(0.8)', opacity: '0'});
        setTimeout(() => {
            $item.remove();
            checkWishlistEmpty();
            showNotification('❌ محصول از علاقه‌مندی‌ها حذف شد', 'error');
        }, 300);
    });
    if ($('#wishlistGrid').length) checkWishlistEmpty();

    // مدیریت آدرس‌ها
    if ($('#addressList').length) {
        // (منطق رندر آدرس‌ها مشابه فایل اصلی شما حفظ شده است)
        $('#addAddressBtn').on('click', function () {
            if (!$(this).prop('disabled')) $('#addressModal').modal('show');
        });
        $(document).on('click', '.address-delete', function () {
            if (confirm('آیا از حذف این آدرس اطمینان دارید؟')) {
                $(this).closest('.address-item').remove();
                showNotification('🗑️ آدرس با موفقیت حذف شد', 'error');
                // update count & UI logic...
            }
        });
        $('#saveAddressBtn').on('click', function () {
            $('#addressModal').modal('hide');
            showNotification('✅ عملیات با موفقیت انجام شد');
        });
    }

    // تیکت و پیام‌ها
    $('#newTicketBtn').on('click', () => {
        $('#ticketForm')[0].reset();
        $('#fileName').text('هیچ فایلی انتخاب نشده است');
        $('#ticketModal').modal('show');
    });
    $('#ticketAttachment').on('change', function () {
        $('#fileName').text(this.files.length ? Array.from(this.files).map(f => f.name).join(', ') : 'هیچ فایلی انتخاب نشده است');
    });
    $('#submitTicketBtn').on('click', () => {
        if (!$('#ticketTitle').val().trim() || !$('#ticketDescription').val().trim()) return showNotification('❌ لطفاً اطلاعات را کامل وارد کنید', 'error');
        $('#ticketModal').modal('hide');
        showNotification('✅ تیکت شما با موفقیت ثبت شد');
    });

    // تنظیمات حساب و تغییر رمز عبور (Modal)
    $('.edit-icon-btn').not('[data-bs-target]').on('click', function () {
        const $input = $('#' + $(this).data('target'));
        $('.account-input-wrapper input').prop('disabled', true);
        $('.edit-icon-btn').removeClass('active-edit');
        if ($input.prop('disabled')) {
            $input.prop('disabled', false).focus();
            $(this).addClass('active-edit');
        }
    });

    let passOtpTimer;
    $('#changePasswordModal').on('shown.bs.modal', function () {
        if (passOtpTimer) clearInterval(passOtpTimer);
        passOtpTimer = startOtpTimer(30, $('#otpTimer'), $('#resendOtpBtn'));
        $('#otpStep').removeClass('d-none');
        $('#passwordStep').addClass('d-none');
        $('.otp-input').val('').first().focus();
    });

    $('#verifyOtpBtn-modal').on('click', function () { // شناسه فرضی برای متمایز کردن دکمه وریفای در مودال
        let code = $('.otp-input', '#changePasswordModal').map((_, el) => el.value).get().join('');
        if (code === '1111') {
            $('#otpStep').addClass('d-none');
            $('#passwordStep').removeClass('d-none');
            clearInterval(passOtpTimer);
        } else {
            $('.otp-container').addClass('shake');
            setTimeout(() => $('.otp-container').removeClass('shake'), 500);
        }
    });

    $('#newPassword').on('input', function () {
        const val = $(this).val();
        $('#reqLength').toggleClass('valid', val.length >= 8).find('i').attr('class', val.length >= 8 ? 'fa-solid fa-circle-check' : 'fa-regular fa-circle');
        $('#reqNumber').toggleClass('valid', /\d/.test(val)).find('i').attr('class', /\d/.test(val) ? 'fa-solid fa-circle-check' : 'fa-regular fa-circle');
        $('#reqUpper').toggleClass('valid', /[A-Z]/.test(val)).find('i').attr('class', /[A-Z]/.test(val) ? 'fa-solid fa-circle-check' : 'fa-regular fa-circle');
    });


    // =========================================
    // 4. SHOP & PRODUCT DETAILS
    // =========================================

    $('.sort-item').on('click', function (e) {
        e.preventDefault();
        $('.sort-item').removeClass('active');
        $(this).addClass('active');
    });

    // افزودن به سبد و علاقه‌مندی (ادغام شده برای فروشگاه و صفحه محصول)
    $(document).on('click', '.add-to-cart, .add-to-cart-btn', function (e) {
        e.preventDefault();
        const $btn = $(this);
        const originalHtml = $btn.html();
        const isDetailsBtn = $btn.hasClass('add-to-cart-btn');

        $btn.html(isDetailsBtn ? '<span class="spinner-border spinner-border-sm"></span> در حال افزودن...' : '<i class="fa-solid fa-spinner fa-spin"></i>').prop('disabled', true);

        setTimeout(() => {
            $btn.html(isDetailsBtn ? '<i class="fa-solid fa-check me-2"></i> اضافه شد!' : '<i class="fa-solid fa-check" style="color:#28a745;"></i>');
            if (isDetailsBtn) $btn.removeClass('btn-primary').addClass('btn-success');

            let count = parseInt($('#cartBadge').text()) || 0;
            $('#cartBadge').text(count + 1);
            $('.cart-item-count').text((count + 1) + ' آیتم');

            setTimeout(() => {
                $btn.html(originalHtml).prop('disabled', false);
                if (isDetailsBtn) $btn.removeClass('btn-success').addClass('btn-primary');
            }, isDetailsBtn ? 2000 : 1000);
        }, 1000);
    });

    $(document).on('click', '.add-to-wishlist, .wishlist-toggle', function (e) {
        e.preventDefault();
        const $icon = $(this).find('i');
        $icon.toggleClass('fa-regular fa-solid').css('color', $icon.hasClass('fa-solid') ? '#dc3545' : '');
    });

    // Product Swipers
    if (typeof Swiper !== 'undefined') {
        if ($('.MobileProductSlider').length) new Swiper('.MobileProductSlider', {
            loop: true,
            pagination: {el: '.MobileProductSlider-pagination', clickable: true}
        });
        if ($('.BestSelling').length) new Swiper('.BestSelling', {
            slidesPerView: 1,
            spaceBetween: 20,
            navigation: {nextEl: '.BestSelling-next-slide', prevEl: '.BestSelling-prev-slide'},
            pagination: {el: '.swiper-pagination', clickable: true},
            breakpoints: {576: {slidesPerView: 2}, 992: {slidesPerView: 3}, 1200: {slidesPerView: 4}}
        });
    }

    // Product Details Interactions
    $('.color-select-btn').on('click', function () {
        $('.color-select-btn').removeClass('border-2 border-primary').addClass('border border-secondary');
        $(this).removeClass('border border-secondary').addClass('border-2 border-primary');
        $('#selectedColorText').text($(this).data('color'));
    });

    $('.increment-btn, .decrement-btn').on('click', function () {
        const $input = $(this).closest('.input-group').find('.quantity-input');
        const isInc = $(this).hasClass('increment-btn');
        let val = parseInt($input.val());
        const limit = parseInt($input.attr(isInc ? 'max' : 'min'));
        if ((isInc && val < limit) || (!isInc && val > limit)) {
            $input.val(isInc ? val + 1 : val - 1).trigger('change');
        }
    });

    $('.quantity-input').on('change', function () {
        const qty = parseInt($(this).val());
        const singlePrice = 99899000; // فرضی برای دمو
        const total = singlePrice * qty;
        $('.total-price-text').text(total.toLocaleString() + ' تومان');
        $('.sticky-top h4').text(total.toLocaleString());
    });

    $('.more-comment-btn').on('click', function () {
        const $hidden = $('.hidden-comment-item.d-none');
        if ($hidden.length) {
            $hidden.slice(0, 2).removeClass('d-none');
            if ($('.hidden-comment-item.d-none').length === 0) $(this).remove();
        } else {
            $(this).remove();
        }
    });

    if (typeof bootstrap !== 'undefined' && bootstrap.Tooltip) {
        $('[data-bs-toggle="tooltip"]').each((_, el) => new bootstrap.Tooltip(el));
    }
});

// Helper Function for Passwords (outside document ready)
window.togglePassword = function (inputId, icon) {
    const input = document.getElementById(inputId);
    input.type = input.type === 'password' ? 'text' : 'password';
    $(icon).toggleClass('fa-eye fa-eye-slash');
};
