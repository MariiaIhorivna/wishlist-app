// Обрано React — бібліотеку для створення користувацьких
// інтерфейсів, яка забезпечує гнучкість розробки,
// можливість вибору додаткових інструментів та має
// велику екосистему готових рішень.

const API_JSONPlaceholder =
  'https://jsonplaceholder.typicode.com/todos?userId=2';

// Масив із бажаннями
const wishList = [
  {
    title: 'Сумка',
    price: 1000,
    priority: 'high',
    completed: false,
  },
  {
    title: 'Друшляк',
    price: 500,
    priority: 'low',
    completed: false,
  },
  {
    title: 'Книжка',
    price: 600,
    priority: 'medium',
    completed: true,
  },
];

// Обчислює загальну суму всіх бажань у масиві та повертає результат
function getTotalCost(wishList) {
  let totalCost = 0;

  for (const wish of wishList) {
    totalCost += wish.price;
  }

  return totalCost;
}

// Класифікація елементів: додаємо прапорець isHighPriority для бажань з високим пріоритетом
for (const wish of wishList) {
  wish.isHighPriority = wish.priority === 'high' ? true : false;
}

// Перевіряє, чи не перевищує ціна елемента заданий бюджет (повертає true або false)
const withinBudget = (price, budget) => price <= budget;

// Перевірка роботи функції withinBudget
const wish = wishList[0];
const itemTitle = wish.title;
const itemPrice = wish.price;
const myBudget = 800;

const result = withinBudget(itemPrice, myBudget);
const resultAnswer = result === true ? 'Так' : 'Ні';
console.log(
  `Чи входить бажання ${itemTitle} вартістю ${itemPrice} грн у бюджет ${myBudget} грн?`,
  resultAnswer,
);

const listContainer = document.querySelector('#wishlist');

// Функція для динамічного створення та виведення карток бажань на сторінку
function renderWishList(wishList) {
  listContainer.innerHTML = '';

  for (const [index, wish] of wishList.entries()) {
    const card = document.createElement('article');
    const titleCard = document.createElement('h3');
    const priceCard = document.createElement('p');

    titleCard.textContent = wish.title;
    priceCard.textContent = `${wish.price} грн`;

    card.append(titleCard, priceCard);
    card.setAttribute('data-priority', wish.priority);
    card.setAttribute('data-index', index);

    card.insertAdjacentHTML(
      'beforeend',
      `<select class="priority-select" aria-label="Пріоритет бажання">
          <option value="low" ${wish.priority === 'low' ? 'selected' : ''}>Низький</option>
          <option value="medium" ${wish.priority === 'medium' ? 'selected' : ''}>Середній</option>
          <option value="high" ${wish.priority === 'high' ? 'selected' : ''}>Високий</option>
      </select>`,
    );

    card.classList.add('wish-card');

    if (wish.completed) {
      card.classList.add('wish-card--purchased');
    }

    const purchasedBtn = document.createElement('button');
    purchasedBtn.classList.add('purchased-btn');

    purchasedBtn.textContent = wish.completed
      ? 'Повернути в список'
      : 'Позначити як придбане';

    purchasedBtn.addEventListener('click', () => {
      wish.completed = !wish.completed;
      renderWishList(wishList);
    });

    if (wish.priority === 'high') {
      card.classList.add('priority-high');
    } else if (wish.priority === 'medium') {
      card.classList.add('priority-medium');
    } else {
      card.classList.add('priority-low');
    }

    listContainer.append(card);
    card.append(purchasedBtn);
  }

  const totalPrice = document.getElementById('total-price');
  totalPrice.textContent = `${getTotalCost(wishList)} грн`;
}

// Обробник події сабміту форми: додає нове бажання до масиву, оновлює інтерфейс і скидає форму
const form = document.querySelector('.add-wish-form');
form.addEventListener('submit', (event) => {
  event.preventDefault();
  const titleValueForm = event.target.elements['wish-title'].value;
  const priceValueForm = Number(event.target.elements['wish-price'].value);
  const priorityValueForm = event.target.elements['wish-priority'].value;

  const newWish = {
    title: titleValueForm,
    price: priceValueForm,
    priority: priorityValueForm,
  };

  wishList.push(newWish);

  renderWishList(wishList);

  form.reset();
});

// Обробник події введення для ціни: перевіряє значення на від'ємність та керує кастомною валідацією
const priceInput = document.querySelector('input[name="wish-price"]');
priceInput.addEventListener('input', () => {
  if (priceInput.value !== '' && Number(priceInput.value) < 0) {
    priceInput.setCustomValidity("Ціна не може бути від'ємною");
    priceInput.reportValidity();
  } else {
    priceInput.setCustomValidity('');
  }
});

// Обробник події change через делегування: оновлює пріоритет бажання в масиві та змінює стиль картки динамічно без перерендеру
listContainer.addEventListener('change', (event) => {
  if (event.target.classList.contains('priority-select')) {
    const selectElement = event.target;
    const newPriority = selectElement.value;

    const card = selectElement.closest('.wish-card');
    const index = card.dataset.index;

    wishList[index].priority = newPriority;

    card.classList.remove('priority-low', 'priority-medium', 'priority-high');
    card.classList.add(`priority-${newPriority}`);
    card.setAttribute('data-priority', newPriority);
  }
});

// Отримання списку завдань з JSONPlaceholder API:
// https://jsonplaceholder.typicode.com/todos?userId=2
async function loadData() {
  const loading = document.getElementById('loading');
  const errorMessage = document.getElementById('error-message');
  const retryBtn = document.getElementById('retry-btn');
  loading.hidden = false;
  errorMessage.hidden = true;
  retryBtn.hidden = true;
  try {
    const response = await fetch(API_JSONPlaceholder);
    if (!response.ok) {
      throw new Error(
        `Помилка HTTP: ${response.status} ${response.statusText}`,
      );
    }
    const data = await response.json();
    const wishes = data
      .filter((wish) => !wishList.some((item) => item.title === wish.title))
      .map((wish) => ({
        title: wish.title,
        completed: wish.completed,
        price: Math.floor(Math.random() * 10000),
      }));

    wishList.push(...wishes);
    renderWishList(wishList);
  } catch (error) {
    errorMessage.textContent =
      'Список бажань недоступний офлайн. Показано раніше завантажені бажання.';
    errorMessage.hidden = false;
    retryBtn.hidden = false;

    console.error('Помилка завантаження даних:', error);
  } finally {
    loading.hidden = true;
  }
}

const retryBtn = document.getElementById('retry-btn');
retryBtn.addEventListener('click', loadData);

loadData();
