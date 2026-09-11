/* ============================================
   Tasty Burger — Interactive JavaScript
   ============================================ */

(function () {
  'use strict';

  /* ---------- Navbar scroll effect ---------- */
  const navbar = document.getElementById('navbar');

  function handleNavScroll() {
    if (window.scrollY > 30) {
      navbar.classList.add('scrolled');
    } else {
      navbar.classList.remove('scrolled');
    }
  }

  window.addEventListener('scroll', handleNavScroll, { passive: true });

  /* ---------- Mobile menu toggle ---------- */
  const navToggle = document.getElementById('navToggle');
  const navMenu = document.getElementById('navMenu');

  navToggle.addEventListener('click', function () {
    navToggle.classList.toggle('active');
    navMenu.classList.toggle('active');
  });

  // Close mobile menu when a link is clicked
  navMenu.querySelectorAll('a').forEach(function (link) {
    link.addEventListener('click', function () {
      navToggle.classList.remove('active');
      navMenu.classList.remove('active');
    });
  });

  /* ---------- Active nav link on scroll ---------- */
  const sections = document.querySelectorAll('section[id]');
  const navLinks = document.querySelectorAll('.nav-link');

  function highlightNavOnScroll() {
    var scrollPos = window.scrollY + 100;

    sections.forEach(function (section) {
      var top = section.offsetTop;
      var height = section.offsetHeight;
      var id = section.getAttribute('id');

      if (scrollPos >= top && scrollPos < top + height) {
        navLinks.forEach(function (link) {
          link.classList.remove('active');
          if (link.getAttribute('href') === '#' + id) {
            link.classList.add('active');
          }
        });
      }
    });
  }

  window.addEventListener('scroll', highlightNavOnScroll, { passive: true });

  /* ---------- Scroll reveal animations ---------- */
  var revealObserver = new IntersectionObserver(
    function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          revealObserver.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.15, rootMargin: '0px 0px -40px 0px' }
  );

  document.querySelectorAll('.reveal').forEach(function (el) {
    revealObserver.observe(el);
  });

  /* ---------- Hero stat counter animation ---------- */
  var statNumbers = document.querySelectorAll('.stat-number');
  var statObserver = new IntersectionObserver(
    function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        var el = entry.target;
        var target = parseInt(el.getAttribute('data-target'), 10);
        var duration = 1800;
        var startTime = null;

        function animate(timestamp) {
          if (!startTime) startTime = timestamp;
          var progress = Math.min((timestamp - startTime) / duration, 1);
          var eased = 1 - Math.pow(1 - progress, 3);
          var current = Math.floor(eased * target);
          el.textContent = current.toLocaleString();
          if (progress < 1) {
            requestAnimationFrame(animate);
          } else {
            el.textContent = target.toLocaleString();
          }
        }

        requestAnimationFrame(animate);
        statObserver.unobserve(el);
      });
    },
    { threshold: 0.5 }
  );

  statNumbers.forEach(function (el) {
    statObserver.observe(el);
  });

  /* ---------- Menu filter ---------- */
  var filterBtns = document.querySelectorAll('.filter-btn');
  var menuCards = document.querySelectorAll('.menu-card');

  filterBtns.forEach(function (btn) {
    btn.addEventListener('click', function () {
      filterBtns.forEach(function (b) {
        b.classList.remove('active');
      });
      btn.classList.add('active');

      var filter = btn.getAttribute('data-filter');

      menuCards.forEach(function (card) {
        if (filter === 'all' || card.getAttribute('data-category') === filter) {
          card.classList.remove('hide');
        } else {
          card.classList.add('hide');
        }
      });
    });
  });

  /* ---------- Cart functionality ---------- */
  var cart = [];
  var cartFab = document.getElementById('cartFab');
  var cartOverlay = document.getElementById('cartOverlay');
  var cartClose = document.getElementById('cartClose');
  var cartItemsEl = document.getElementById('cartItems');
  var cartBadge = document.getElementById('cartBadge');
  var cartTotalEl = document.getElementById('cartTotal');
  var cartCheckout = document.getElementById('cartCheckout');
  var toast = document.getElementById('toast');
  var toastMessage = document.getElementById('toastMessage');
  var toastTimer = null;

  function showToast(message) {
    toastMessage.textContent = message;
    toast.classList.add('show');
    if (toastTimer) clearTimeout(toastTimer);
    toastTimer = setTimeout(function () {
      toast.classList.remove('show');
    }, 2500);
  }

  function updateCartBadge() {
    var totalQty = cart.reduce(function (sum, item) {
      return sum + item.qty;
    }, 0);

    if (totalQty > 0) {
      cartBadge.textContent = totalQty;
      cartBadge.classList.remove('hide');
    } else {
      cartBadge.classList.add('hide');
    }
  }

  function updateCartTotal() {
    var total = cart.reduce(function (sum, item) {
      return sum + item.price * item.qty;
    }, 0);
    cartTotalEl.textContent = total + ' DH';
  }

  function renderCart() {
    if (cart.length === 0) {
      cartItemsEl.innerHTML = '<p class="cart-empty">Your cart is empty. Add some delicious items!</p>';
      cartCheckout.style.display = 'none';
    } else {
      cartCheckout.style.display = '';
      var html = '';
      cart.forEach(function (item, index) {
        html +=
          '<div class="cart-item-row">' +
            '<div class="cart-item-info">' +
              '<div class="cart-item-name">' + item.name + '</div>' +
              '<div class="cart-item-price">' + item.price + ' DH each</div>' +
            '</div>' +
            '<div class="cart-item-qty">' +
              '<button class="cart-qty-btn" data-action="decrease" data-index="' + index + '">−</button>' +
              '<span class="cart-qty-num">' + item.qty + '</span>' +
              '<button class="cart-qty-btn" data-action="increase" data-index="' + index + '">+</button>' +
            '</div>' +
            '<button class="cart-item-remove" data-action="remove" data-index="' + index + '">✕</button>' +
          '</div>';
      });
      cartItemsEl.innerHTML = html;
    }

    updateCartBadge();
    updateCartTotal();
  }

  function addToCart(name, price) {
    var existing = cart.find(function (item) {
      return item.name === name;
    });

    if (existing) {
      existing.qty++;
    } else {
      cart.push({ name: name, price: price, qty: 1 });
    }

    showToast(name + ' added to your order!');
    renderCart();
  }

  // Attach order button listeners
  document.querySelectorAll('.btn-order').forEach(function (btn) {
    btn.addEventListener('click', function () {
      var name = btn.getAttribute('data-item');
      var price = parseInt(btn.getAttribute('data-price'), 10);
      addToCart(name, price);

      // Brief visual feedback
      btn.textContent = 'Added! ✓';
      setTimeout(function () {
        btn.textContent = 'Add to Order';
      }, 1200);
    });
  });

  // Cart item quantity / remove handlers (event delegation)
  cartItemsEl.addEventListener('click', function (e) {
    var target = e.target;
    if (!target.hasAttribute('data-action')) return;

    var action = target.getAttribute('data-action');
    var index = parseInt(target.getAttribute('data-index'), 10);

    if (action === 'increase') {
      cart[index].qty++;
    } else if (action === 'decrease') {
      cart[index].qty--;
      if (cart[index].qty <= 0) {
        cart.splice(index, 1);
      }
    } else if (action === 'remove') {
      cart.splice(index, 1);
    }

    renderCart();
  });

  // Open / close cart modal
  cartFab.addEventListener('click', function () {
    cartOverlay.classList.add('active');
  });

  cartClose.addEventListener('click', function () {
    cartOverlay.classList.remove('active');
  });

  cartOverlay.addEventListener('click', function (e) {
    if (e.target === cartOverlay) {
      cartOverlay.classList.remove('active');
    }
  });

  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') {
      cartOverlay.classList.remove('active');
    }
  });

  /* ---------- Checkout via WhatsApp ---------- */
  cartCheckout.addEventListener('click', function () {
    if (cart.length === 0) return;

    var message = 'Hello Tasty Burger! I would like to order:\n\n';
    cart.forEach(function (item) {
      message += '• ' + item.name + ' x' + item.qty + ' — ' + (item.price * item.qty) + ' DH\n';
    });
    var total = cart.reduce(function (sum, item) {
      return sum + item.price * item.qty;
    }, 0);
    message += '\nTotal: ' + total + ' DH\n\nDelivery address: ';

    var encoded = encodeURIComponent(message);
    window.open('https://wa.me/212600000000?text=' + encoded, '_blank');
  });

  /* ---------- Initial render ---------- */
  renderCart();
})();
