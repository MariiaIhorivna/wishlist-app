document.querySelectorAll('.wish-card').forEach(card => card.remove());

// Масив із бажаннями
const wishList = [
  {
    title: 'Сумка',
    price: 1000,
    priority: 'високий'
  },
  {
    title: 'Друшляк',
    price: 500,
    priority: 'низький'
  },
  {
    title: 'Книжка',
    price: 600,
    priority: 'середній'
  }
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
  wish.isHighPriority = wish.priority === 'високий' ? true : false;
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
console.log(`Чи входить бажання ${itemTitle} вартістю ${itemPrice} грн у бюджет ${myBudget} грн?`, resultAnswer);

const listContainer = document.querySelector('#wishlist');

// Функція для динамічного створення та виведення карток бажань на сторінку
function renderWishList(wishList)
{
  for (const wish of wishList)
  {
    const card = document.createElement('article');
    const titleCard = document.createElement('h3');
    const priceCard = document.createElement('p');

    titleCard.textContent = wish.title;
    priceCard.textContent = wish.price;

    card.append(titleCard, priceCard);
    card.setAttribute('data-priority', wish.priority);

    card.classList.add('wish-card');
    
    if (wish.priority === 'високий')
    {
      card.classList.add('priority-high');
    } else if (wish.priority === 'середній')
    {
      card.classList.add('priority-medium');
    } else {
      card.classList.add('priority-low');
    }

    listContainer.append(card);
  }
}

renderWishList(wishList);
const totalPrice = document.getElementById('total-price');
totalPrice.textContent = `${getTotalCost(wishList)} грн`;