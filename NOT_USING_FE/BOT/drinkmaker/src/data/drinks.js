// List of cocktail recipes for the DrinkMaker app
// Each drink object contains an id, name, short description,
// an array of ingredients (with name and amount), and step‑by‑step
// preparation instructions. Feel free to add more recipes here.

const drinks = [
  {
    id: 1,
    name: 'Mojito',
    description: 'A refreshing blend of rum, lime, mint and soda.',
    ingredients: [
      { name: 'White rum', amount: '50 ml' },
      { name: 'Lime', amount: '1 (cut into wedges)' },
      { name: 'Sugar', amount: '2 tsp' },
      { name: 'Fresh mint leaves', amount: '6' },
      { name: 'Soda water', amount: 'to top' },
      { name: 'Ice', amount: 'crushed' },
    ],
    instructions: [
      'Place the mint leaves, sugar and lime wedges in the bottom of a sturdy glass.',
      'Muddle the ingredients gently with a muddler or the back of a spoon to release the lime juice and mint oils.',
      'Fill the glass with crushed ice and pour in the rum.',
      'Top up with soda water and stir well to combine.',
      'Garnish with a sprig of mint and a lime wheel before serving.',
    ],
  },
  {
    id: 2,
    name: 'Margarita',
    description: 'A classic tequila cocktail with lime and triple sec.',
    ingredients: [
      { name: 'Tequila', amount: '50 ml' },
      { name: 'Lime juice', amount: '25 ml' },
      { name: 'Triple sec', amount: '20 ml' },
      { name: 'Salt', amount: 'for rimming' },
      { name: 'Ice', amount: 'cubed' },
    ],
    instructions: [
      'Rub a lime wedge around the rim of a margarita glass and dip it into salt to coat.',
      'Fill a shaker with ice and add the tequila, fresh lime juice and triple sec.',
      'Shake vigorously for about 15 seconds until well chilled.',
      'Strain the mixture into the prepared glass over fresh ice.',
      'Garnish with a slice of lime on the rim.',
    ],
  },
  {
    id: 3,
    name: 'Old Fashioned',
    description: 'A smooth bourbon drink sweetened with sugar and bitters.',
    ingredients: [
      { name: 'Bourbon', amount: '60 ml' },
      { name: 'Sugar cube', amount: '1' },
      { name: 'Angostura bitters', amount: '2 dashes' },
      { name: 'Orange peel', amount: 'for garnish' },
      { name: 'Ice', amount: 'large cubes' },
    ],
    instructions: [
      'Place the sugar cube in an old fashioned glass and saturate it with bitters.',
      'Add a splash of water and muddle until the sugar dissolves.',
      'Fill the glass with a large ice cube (or several smaller cubes).',
      'Pour the bourbon over the ice and gently stir for 10–15 seconds.',
      'Express the oils from an orange peel over the drink, then add the peel as a garnish.',
    ],
  },
  {
    id: 4,
    name: 'Piña Colada',
    description: 'A tropical blend of rum, coconut and pineapple.',
    ingredients: [
      { name: 'White rum', amount: '50 ml' },
      { name: 'Coconut cream', amount: '30 ml' },
      { name: 'Pineapple juice', amount: '50 ml' },
      { name: 'Pineapple slice', amount: 'for garnish' },
      { name: 'Crushed ice', amount: '1 cup' },
    ],
    instructions: [
      'Add the rum, coconut cream and pineapple juice to a blender.',
      'Fill with a cup of crushed ice and blend until smooth and frothy.',
      'Pour into a chilled hurricane or highball glass.',
      'Garnish with a pineapple slice or wedge and a cocktail cherry if desired.',
    ],
  },
]

export default drinks