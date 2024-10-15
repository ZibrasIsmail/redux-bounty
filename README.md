# Redux E-Commerce Platform

This is a full-stack e-commerce platform built with Next.js, Redux, and SQLite. It features user authentication, role-based access control, product management, and order processing.

## Features

- User authentication (register, login, logout)
- Role-based access control (Admin, Seller, Shopper)
- Product management (add, edit, delete products)
- Shopping cart functionality
- Order processing
- Admin dashboard
- Seller dashboard
- Shopper dashboard

## Tech Stack

- Frontend: Next.js, React, Redux Toolkit
- Backend: Next.js API routes
- Database: SQLite
- Authentication: JWT
- Styling: Tailwind CSS

## Getting Started

1. Clone the repository:
   ```
   git clone https://github.com/zibiassha/redux-bounty.git
   cd redux-bounty
   ```

2. Install dependencies:
   ```
   npm install
   ```

3. Set up environment variables:
   Create a `.env.local` file in the root directory and add:
   ```
   JWT_SECRET=your_jwt_secret_here
   ```

4. Run the development server:
   ```
   npm run dev
   ```

5. Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Creating an Admin User

1. Register a new user through the application's registration form.
2. Locate the SQLite database file (usually `ecommerce.db` in the project root).
3. Use a SQLite3 Editor VS code extentions to edit the user role an admin.
5. Change the `role` field for this user from `'shopper'` to `'admin'`.
6. Save the changes to the database.
7. Log out and log back in with the user's credentials. They should now have admin access.

## Project Structure

- `/app`: Next.js app router pages and API routes
- `/components`: React components
- `/lib`: Utility functions, Redux store, and slices
- `/public`: Static files
- `/styles`: Global styles

## API Routes

- `/api/login`: User login
- `/api/register`: User registration
- `/api/products`: Product management
- `/api/orders`: Order processing
- `/api/users`: User management (admin only)

## Role-Based Access

- Admin: Can manage users, view all orders, and perform all seller actions
- Seller: Can add, edit, and delete their own products
- Shopper: Can browse products, add to cart, and place orders

## Database Schema

- `users`: id, name, email, password (hashed), role
- `products`: id, name, description, price, quantity, image_url, seller_id
- `orders`: id, user_id, total_amount, status, created_at
- `order_items`: id, order_id, product_id, quantity, price

## App Demo Video

https://github.com/user-attachments/assets/72fd7dd3-0bbd-4050-bf0b-60caf93af692



## License

This project is licensed under the MIT License.
