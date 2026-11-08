// Обрано React — бібліотеку для створення користувацьких
// інтерфейсів, яка забезпечує гнучкість розробки,
// можливість вибору додаткових інструментів та має
// велику екосистему готових рішень.

const API_JSONPlaceholder =
  'https://jsonplaceholder.typicode.com/todos?userId=2';

function App() {
  const [wishList, setWishList] = React.useState([
    {
      id: 1,
      title: 'Сумка',
      price: 1000,
      priority: 'high',
      completed: false,
    },
    {
      id: 2,
      title: 'Друшляк',
      price: 500,
      priority: 'low',
      completed: false,
    },
    {
      id: 3,
      title: 'Книжка',
      price: 600,
      priority: 'medium',
      completed: true,
    },
  ]);

  const [isLoading, setIsLoading] = React.useState(true);
  const [error, setError] = React.useState('');
  const [reload, setReload] = React.useState(0);

  const [title, setTitle] = React.useState('');
  const [price, setPrice] = React.useState('');
  const [priority, setPriority] = React.useState('medium');

  function toggleWish(id) {
    setWishList((prevWishList) =>
      prevWishList.map((wish) =>
        wish.id === id ? { ...wish, completed: !wish.completed } : wish,
      ),
    );
  }

  function changePriority(id, newPriority) {
    setWishList((prevWishList) =>
      prevWishList.map((wish) =>
        wish.id === id ? { ...wish, priority: newPriority } : wish,
      ),
    );
  }

  function addWish(event) {
    event.preventDefault();

    const newWish = {
      id: `local-${Date.now()}`,
      title: title.trim(),
      price: Number(price),
      priority: priority,
      completed: false,
    };

    setWishList((prevWishList) => [...prevWishList, newWish]);

    setTitle('');
    setPrice('');
    setPriority('medium');
  }

  React.useEffect(() => {
    async function loadData() {
      setIsLoading(true);
      setError('');

      try {
        const response = await fetch(API_JSONPlaceholder);

        if (!response.ok) {
          throw new Error(
            `Помилка HTTP: ${response.status} ${response.statusText}`,
          );
        }

        const data = await response.json();

        setWishList((prevWishList) => {
          const newWishes = data
            .filter(
              (wish) => !prevWishList.some((item) => item.title === wish.title),
            )
            .map((wish) => ({
              id: wish.id,
              title: wish.title,
              completed: wish.completed,
              price: Math.floor(Math.random() * 10000),
              priority: 'low',
            }));

          return [...prevWishList, ...newWishes];
        });
      } catch (error) {
        setError(
          'Список бажань недоступний офлайн. Показано раніше завантажені бажання.',
        );

        console.error('Помилка завантаження даних:', error);
      } finally {
        setIsLoading(false);
      }
    }

    loadData();
  }, [reload]);

  return (
    <>
      <main>
        <section>
          <h2>Додати бажання</h2>

          <form className="add-wish-form" onSubmit={addWish}>
            <label htmlFor="add-wish-title-input">Назва бажання</label>

            <input
              className="add-wish-input"
              type="text"
              placeholder="Машина"
              id="add-wish-title-input"
              name="wish-title"
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              required
            />

            <label htmlFor="add-wish-price-input">Ціна бажання</label>

            <input
              className="add-wish-input"
              type="number"
              placeholder="10000 (вказується в гривнях)"
              min="0"
              step="0.01"
              id="add-wish-price-input"
              name="wish-price"
              value={price}
              onChange={(event) => setPrice(event.target.value)}
              required
            />

            <label htmlFor="wishPriority">Пріоритет</label>

            <select
              name="wish-priority"
              id="wishPriority"
              className="priority-select"
              value={priority}
              onChange={(event) => setPriority(event.target.value)}
            >
              <option value="low">Низький ⚪</option>
              <option value="medium">Середній 🟡</option>
              <option value="high">Високий 🔴</option>
            </select>

            <div className="add-wish-btn-container">
              <button
                type="submit"
                className="add-wish-btn add-wish-btn-submit"
              >
                Додати бажання
              </button>

              <button
                type="button"
                className="add-wish-btn add-wish-btn-reset"
                onClick={() => {
                  setTitle('');
                  setPrice('');
                  setPriority('medium');
                }}
              >
                Очистити поля
              </button>
            </div>
          </form>
        </section>

        <section>
          <h2>Мої бажання</h2>

          {isLoading && <p id="loading">Завантаження...</p>}

          {error && <p id="error-message">{error}</p>}

          <button
            type="button"
            id="retry-btn"
            onClick={() => setReload((prev) => prev + 1)}
          >
            Оновити
          </button>

          <div className="cards">
            {wishList.map((wish) => (
              <WishItem
                key={wish.id}
                id={wish.id}
                name={wish.title}
                price={wish.price}
                priority={wish.priority}
                completed={wish.completed}
                toggle={toggleWish}
                changePriority={changePriority}
              />
            ))}
          </div>
        </section>
      </main>

      <aside>
        <h2>Підсумкова сума</h2>
        <p>{getTotalCost(wishList)} грн</p>
      </aside>
    </>
  );
}

function WishItem({
  id,
  name,
  price,
  priority,
  completed,
  toggle,
  changePriority,
}) {
  return (
    <article
      className={`wish-card priority-${priority} ${
        completed ? 'wish-card--purchased' : ''
      }`}
    >
      <h3>{name}</h3>
      <p>{price} грн</p>

      <select
        className="priority-select"
        aria-label="Пріоритет бажання"
        value={priority}
        onChange={(event) => changePriority(id, event.target.value)}
      >
        <option value="low">Низький</option>
        <option value="medium">Середній</option>
        <option value="high">Високий</option>
      </select>

      <button className="purchased-btn" onClick={() => toggle(id)}>
        {completed ? 'Повернути в список' : 'Позначити як придбане'}
      </button>
    </article>
  );
}

const root = ReactDOM.createRoot(document.getElementById('app-root'));
root.render(<App />);

// Масив із бажаннями (тепер зберігається в середині App через useState)
/*const wishList = [
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
];*/

// Обчислює загальну суму всіх бажань у масиві та повертає результат
function getTotalCost(wishList) {
  let totalCost = 0;

  for (const wish of wishList) {
    totalCost += wish.price;
  }

  return totalCost;
}

// Усю основну частину інтерфейсу перенесено на React.
// Ручне створення DOM-елементів більше не використовується.

// Класифікація елементів: додаємо прапорець isHighPriority для бажань з високим пріоритетом
// for (const wish of wishList) {
//   wish.isHighPriority = wish.priority === 'high' ? true : false;
// }

// const listContainer = document.querySelector('#wishlist');

// Функція для динамічного створення та виведення карток бажань на сторінку
/*function renderWishList(wishList) {
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
}*/

// Обробник події сабміту форми: додає нове бажання до масиву, оновлює інтерфейс і скидає форму
// const form = document.querySelector('.add-wish-form');
// form.addEventListener('submit', (event) => {
//   event.preventDefault();
//   const titleValueForm = event.target.elements['wish-title'].value;
//   const priceValueForm = Number(event.target.elements['wish-price'].value);
//   const priorityValueForm = event.target.elements['wish-priority'].value;

//   const newWish = {
//     title: titleValueForm,
//     price: priceValueForm,
//     priority: priorityValueForm,
//   };

//   wishList.push(newWish);

//   renderWishList(wishList);

//   form.reset();
// });

// // Обробник події введення для ціни: перевіряє значення на від'ємність та керує кастомною валідацією
// const priceInput = document.querySelector('input[name="wish-price"]');
// priceInput.addEventListener('input', () => {
//   if (priceInput.value !== '' && Number(priceInput.value) < 0) {
//     priceInput.setCustomValidity("Ціна не може бути від'ємною");
//     priceInput.reportValidity();
//   } else {
//     priceInput.setCustomValidity('');
//   }
// });

// // Обробник події change через делегування: оновлює пріоритет бажання в масиві та змінює стиль картки динамічно без перерендеру
// listContainer.addEventListener('change', (event) => {
//   if (event.target.classList.contains('priority-select')) {
//     const selectElement = event.target;
//     const newPriority = selectElement.value;

//     const card = selectElement.closest('.wish-card');
//     const index = card.dataset.index;

//     wishList[index].priority = newPriority;

//     card.classList.remove('priority-low', 'priority-medium', 'priority-high');
//     card.classList.add(`priority-${newPriority}`);
//     card.setAttribute('data-priority', newPriority);
//   }
// });

// Отримання списку завдань з JSONPlaceholder API:
// https://jsonplaceholder.typicode.com/todos?userId=2
// async function loadData() {
//   const loading = document.getElementById('loading');
//   const errorMessage = document.getElementById('error-message');
//   const retryBtn = document.getElementById('retry-btn');
//   loading.hidden = false;
//   errorMessage.hidden = true;
//   retryBtn.hidden = true;
//   try {
//     const response = await fetch(API_JSONPlaceholder);
//     if (!response.ok) {
//       throw new Error(
//         `Помилка HTTP: ${response.status} ${response.statusText}`,
//       );
//     }
//     const data = await response.json();
//     const wishes = data
//       .filter((wish) => !wishList.some((item) => item.title === wish.title))
//       .map((wish) => ({
//         title: wish.title,
//         completed: wish.completed,
//         price: Math.floor(Math.random() * 10000),
//       }));

//     wishList.push(...wishes);
//     renderWishList(wishList);
//   } catch (error) {
//     errorMessage.textContent =
//       'Список бажань недоступний офлайн. Показано раніше завантажені бажання.';
//     errorMessage.hidden = false;
//     retryBtn.hidden = false;

//     console.error('Помилка завантаження даних:', error);
//   } finally {
//     loading.hidden = true;
//   }
// }

// const retryBtn = document.getElementById('retry-btn');
// retryBtn.addEventListener('click', loadData);

// loadData();
