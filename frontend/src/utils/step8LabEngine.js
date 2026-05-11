const buildCountMap = (list = []) => {
  const map = {};
  list.forEach((id) => {
    if (!id) return;
    map[id] = (map[id] || 0) + 1;
  });
  return map;
};

const hasEnoughItems = (sourceMap, requiredMap) => {
  return Object.keys(requiredMap).every((id) => (sourceMap[id] || 0) >= requiredMap[id]);
};

export const canCraftRecipe = (workspaceItems = [], recipe) => {
  if (!recipe || !Array.isArray(recipe.inputs) || recipe.inputs.length === 0) return false;
  const sourceMap = buildCountMap(workspaceItems);
  const requiredMap = buildCountMap(recipe.inputs);
  return hasEnoughItems(sourceMap, requiredMap);
};

export const consumeRecipeInputs = (workspaceItems = [], recipe) => {
  if (!canCraftRecipe(workspaceItems, recipe)) return null;
  const requiredMap = buildCountMap(recipe.inputs);
  const remaining = [];

  workspaceItems.forEach((id) => {
    if (requiredMap[id] && requiredMap[id] > 0) {
      requiredMap[id] -= 1;
      return;
    }
    remaining.push(id);
  });

  return remaining;
};

export const pickCraftableRecipe = (recipes = [], workspaceItems = [], recipeProgress = {}) => {
  for (let i = 0; i < recipes.length; i += 1) {
    const recipe = recipes[i];
    if (!recipe || !recipe.id || recipeProgress[recipe.id] === true) continue;
    if (canCraftRecipe(workspaceItems, recipe)) return recipe;
  }
  return null;
};

export const findNextRecipeHint = (recipes = [], recipeProgress = {}) => {
  const next = recipes.find((recipe) => recipe && recipe.id && recipeProgress[recipe.id] !== true);
  return next ? (next.hint || '') : '';
};

export const computeStep8Stage = ({ hasFinal, watchedOp1, watchedOp2, completed }) => {
  if (completed) return 'done';
  if (!hasFinal) return 'build';
  if (!(watchedOp1 && watchedOp2)) return 'observe';
  return 'upload';
};

export default {
  canCraftRecipe,
  consumeRecipeInputs,
  pickCraftableRecipe,
  findNextRecipeHint,
  computeStep8Stage
};
