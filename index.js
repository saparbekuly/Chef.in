// Attach event listener to search button
document.getElementById('searchButton').addEventListener('click', searchRecipes);

// Async function to fetch and display recipes based on search input
async function searchRecipes() {
  const searchInput = document.getElementById("searchInput").value;
  const recipesContainer = document.getElementById("recipesContainer");
  const recipeDetail = document.getElementById("recipeDetail");
  const loadingBar = document.getElementById("loadingBar");

  // Clear previous search results and hide recipe detail section
  recipesContainer.innerHTML = "";
  recipeDetail.classList.remove('active');

  // Display and animate the loading bar
  loadingBar.style.width = '0%';
  loadingBar.style.display = 'block';
  setTimeout(() => {
    loadingBar.style.width = '100%';
  }, 100);

  try {
    // Fetch recipes from the API
    const response = await fetch(`https://api.edamam.com/search?q=${searchInput}&app_id=458c6b7b&app_key=d0c9bf796296c85eed36a50027c0b3a1`);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    console.log(data);

    // If no recipes are found, display a message
    if (data.hits.length === 0) {
      recipesContainer.innerHTML = "<p>Nothing found matching your request.</p>";
    } else {
      // Use DocumentFragment to minimize reflows and repaints
      const fragment = document.createDocumentFragment();
      data.hits.forEach(hit => {
        const recipe = hit.recipe;
        const recipeDiv = document.createElement('div');
        recipeDiv.classList.add('recipe');
        recipeDiv.innerHTML = `
          <h2>${recipe.label}</h2>
          <img src="${recipe.image}" alt="${recipe.label}">
          <p>Calories: ${Math.round(recipe.calories)}</p>
          <p>Servings: ${recipe.yield}</p>
          <button data-recipe='${encodeURIComponent(JSON.stringify(recipe))}'>View Recipe</button>
        `;
        fragment.appendChild(recipeDiv);
      });
      recipesContainer.appendChild(fragment);
    }
  } catch (error) {
    console.error("Error fetching recipes:", error);
  } finally {
    // Hide the loading bar after the fetch operation
    loadingBar.style.width = '0%';
    setTimeout(() => {
      loadingBar.style.display = 'none';
    }, 300);
  }
}

// Event delegation for handling dynamic "View Recipe" buttons
document.getElementById('recipesContainer').addEventListener('click', event => {
  if (event.target.tagName === 'BUTTON') {
    showRecipeDetail(event.target.getAttribute('data-recipe'));
  }
});

// Function to display detailed information about a selected recipe
function showRecipeDetail(recipeString) {
  const recipe = JSON.parse(decodeURIComponent(recipeString));
  const recipeDetail = document.getElementById("recipeDetail");

  recipeDetail.innerHTML = `
    <h2>${recipe.label}</h2>
    <img src="${recipe.image}" alt="${recipe.label}">
    <p>Calories: ${Math.round(recipe.calories)}</p>
    <p>Servings: ${recipe.yield}</p>
    <h3>Ingredients:</h3>
    <ul>
      ${recipe.ingredientLines.map(ingredient => `<li>${ingredient}</li>`).join('')}
    </ul>
    <h3>Instructions:</h3>
    <a href="${recipe.url}" target="_blank">View Full Instructions</a>
  `;
  recipeDetail.classList.add('active');
  recipeDetail.scrollIntoView({ behavior: 'smooth', block: 'start' });
}
