# supamarket
Is the Shizzz! You know what I'm sayin?

# Phase 1 

## Backend
- Optimized DB
- Optimized Network
- Paginate
- Autocomplete

## Frontend
- Sorting by price, value, store and name - **DONE**
- Paginate - **DONE**
- Add/Remove from shopping list - **DONE**
- Separation of concerns and classifying things
- Unit Testing

# Phase 2

## Backend
- Details section
- Search overhaul including (fuzzy search, relevancy)
- Authentication
- Favourites

## Frontend
- Details section
- Print shopping list
- Authentication
- Design + Logo
- Favourites

# JSON structure
```javascript
[{
  "s":"xxx",        // Store
  "q":"xxx",        // Query (formerly keyword)
  "id":"xxx",       // ID
  "n":"xxx",        // Name
  "im":"xxx",       // Image
  "p":xx.xx,        // Price
  "m":"xxx",        // Measure
  "pd":"xxx",       // Price Description
  "pr":"xxx",       // Promo
  "c":"xx|xx|xx",   // Category
  "l":"xxx"         // Limited
},{},{}]
```
## Description
- Store - What store the product came from. e.g. "a" (Aldi), "t" (Tesco), "s" (SuperValu)
- Query (formerly keyword) - The search term used to find this product. e.g. "milk"
- ID - A unique ID for the product. e.g. "1004980000"
- Name - The product name. e.g. "Ritchies Milky Toffee"
- Image - The filename of the image. e.g. "5099839260230_2.JPG"
- Price - The price of the item. e.g. 3.33
- Measure - The unit the price applies to. e.g. "each"
- Price Description - The standardised price. e.g. "€0.73 per litre"
- Promo - Information about offers. e.g. "Was €2.37, Now €1.18, Save €1.19"
- Category - The category hierarchy. e.g. "Kitchen Cupboard|Chocolate & Sweets|Chocolate & Sugar Bags"
- Limited - Product only available until this date. e.g. "21th Feb"
