// src/data/mockMenus.ts

export type LocationKey = "marciano" | "warren";
export type MealKey = "breakfast" | "lunch" | "dinner";

export type MenuItem = {
  id: string;
  title: string;
  station?: string;
  calories?: number;
  macros?: string;
};

type MenuByMeal = Record<MealKey, MenuItem[]>;

/**
 * ---- Base menu pools ----
 * These are reused across days to simulate rotation
 */

const BASE_MENUS: Record<LocationKey, Record<MealKey, MenuItem[]>> = {
  marciano: {
    breakfast: [
      {
        id: "eggs",
        title: "Scrambled Eggs",
        station: "Brick Oven",
        calories: 140,
        macros: "3g fat | 1g carbs | 12g protein",
      },
      {
        id: "sausage",
        title: "Turkey Sausage",
        station: "Brick Oven",
        calories: 90,
        macros: "2g fat | 1g carbs | 7g protein",
      },
      {
        id: "pancakes",
        title: "Buttermilk Pancakes",
        station: "Griddle",
        calories: 320,
        macros: "8g fat | 50g carbs | 6g protein",
      },
    ],
    lunch: [
      {
        id: "chicken-bowl",
        title: "Chicken Grain Bowl",
        station: "Global Kitchen",
        calories: 520,
        macros: "8g fat | 55g carbs | 32g protein",
      },
      {
        id: "salad",
        title: "Garden Salad",
        station: "Salad Bar",
        calories: 180,
        macros: "1g fat | 18g carbs | 6g protein",
      },
      {
        id: "burger",
        title: "Cheeseburger",
        station: "Grill",
        calories: 650,
        macros: "28g fat | 45g carbs | 35g protein",
      },
    ],
    dinner: [
      {
        id: "pasta",
        title: "Pasta Primavera",
        station: "Main Line",
        calories: 610,
        macros: "6g fat | 80g carbs | 18g protein",
      },
      {
        id: "salmon",
        title: "Roasted Salmon",
        station: "Chef's Table",
        calories: 540,
        macros: "22g fat | 4g carbs | 45g protein",
      },
      {
        id: "kung-pao-chicken",
        title: "Kung Pao Chicken",
        station: "International",
        calories: 125,
        macros: "1g saturated fat | 5g carbs | 14g proteins",
      },
      {
        id: "stir-fry-vegetables",
        title: "Stir-Fry Vegetables",
        station: "International",
        calories: 45,
        macros: "0g saturated fat | 5g carbs | 1g proteins",
      },
      {
        id: "kachumber-salad",
        title: "Kachumber Salad",
        station: "Concept Kitchen",
        calories: 35,
        macros: "0g saturated fat | 8g carbs | 1g proteins",
      },
    ],
  },

  warren: {
    breakfast: [
      {
        id: "oatmeal",
        title: "Steel-Cut Oatmeal",
        station: "Hot Bar",
        calories: 220,
        macros: "4g fat | 40g carbs | 8g protein",
      },
      {
        id: "fruit",
        title: "Fresh Fruit Cup",
        station: "Grab & Go",
        calories: 90,
        macros: "0g fat | 22g carbs | 1g protein",
      },
    ],
    lunch: [
      {
        id: "turkey-sandwich",
        title: "Turkey Sandwich",
        station: "Deli",
        calories: 480,
        macros: "4g fat | 50g carbs | 28g protein",
      },
      {
        id: "mac-cheese",
        title: "Mac & Cheese",
        station: "Comfort",
        calories: 620,
        macros: "25g fat | 65g carbs | 20g protein",
      },
    ],
    dinner: [
      {
        id: "stir-fry",
        title: "Vegetable Stir Fry",
        station: "Wok",
        calories: 560,
        macros: "3g fat | 70g carbs | 26g protein",
      },
      {
        id: "chicken-parm",
        title: "Chicken Parmesan",
        station: "Italian",
        calories: 710,
        macros: "30g fat | 60g carbs | 42g protein",
      },

      {
        id: "kung-pao-chicken",
        title: "Kung Pao Chicken",
        station: "International",
        calories: 125,
        macros: "1g saturated fat | 5g carbs | 14g proteins",
      },
      {
        id: "rice-noodles",
        title: "Rice Noodles",
        station: "International",
        calories: 210,
        macros: "0g saturated fat | 47g carbs | 4g proteins",
      },
      {
        id: "stir-fry-vegetables",
        title: "Stir-Fry Vegetables",
        station: "International",
        calories: 45,
        macros: "0g saturated fat | 5g carbs | 1g proteins",
      },
      {
        id: "mojo-pork",
        title: "Mojo Pork",
        station: "Concept Kitchen",
        calories: 190,
        macros: "4g saturated fat | 3g carbs | 16g proteins",
      },
      {
        id: "kachumber-salad",
        title: "Kachumber Salad",
        station: "Concept Kitchen",
        calories: 35,
        macros: "0g saturated fat | 8g carbs | 1g proteins",
      },
      {
        id: "corn-tortilla",
        title: "Corn Tortilla",
        station: "Home Zone",
        calories: 35,
        macros: "0g saturated fat | 8g carbs | 1g proteins",
      },
      {
        id: "shredded-beef-brisket",
        title: "Shredded Beef Brisket",
        station: "Home Zone",
        calories: 160,
        macros: "3g saturated fat | 1g carbs | 18g proteins",
      },
    ],
  },
};

/**
 * ---- Date helpers ----
 */

function getDayIndex(dateKey: string) {
  // Deterministic rotation based on date
  const d = new Date(dateKey);
  return d.getDate();
}

/**
 * ---- Public API ----
 * Returns menu for a given location + date
 */

export function getMockMenu(location: LocationKey, dateKey: string): MenuByMeal {
  const dayIndex = getDayIndex(dateKey);
  const base = BASE_MENUS[location];

  function rotate<T>(items: T[]): T[] {
    if (items.length <= 1) return items;
    const shift = dayIndex % items.length;
    return [...items.slice(shift), ...items.slice(0, shift)];
  }

  return {
    breakfast: rotate(base.breakfast),
    lunch: rotate(base.lunch),
    dinner: rotate(base.dinner),
  };
}