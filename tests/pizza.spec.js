import { test, expect } from 'playwright-test-coverage';

test('home page and docs', async ({ page }) => {
  await page.goto('/');
  expect(await page.title()).toBe('JWT Pizza');

  await page.goto('/docs');
  await page.goto('/documents');
  await expect(page.getByLabel('Global').getByRole('img')).toBeVisible();
  await page.goto('/');
  await page.getByRole('link', { name: 'home' }).click();
  await page.getByRole('link', { name: 'About' }).click();
  
});


test('purchase with login', async ({ page }) => {
    await page.route('*/**/api/order/menu', async (route) => {
      const menuRes = [
        { id: 1, title: 'Veggie', image: 'pizza1.png', price: 0.0038, description: 'A garden of delight' },
        { id: 2, title: 'Pepperoni', image: 'pizza2.png', price: 0.0042, description: 'Spicy treat' },
      ];
      expect(route.request().method()).toBe('GET');
      await route.fulfill({ json: menuRes });
    });
  
    await page.route('*/**/api/franchise', async (route) => {
      const franchiseRes = [{
          id: 2,
          name: 'LotaPizza',
          stores: [
            { id: 4, name: 'Lehi' },
            { id: 5, name: 'Springville' },
            { id: 6, name: 'American Fork' },
          ],
        },
        { id: 3, name: 'PizzaCorp', stores: [{ id: 7, name: 'Spanish Fork' }] },
        { id: 4, name: 'topSpot', stores: [] },
      ];
      expect(route.request().method()).toBe('GET');
      await route.fulfill({ json: franchiseRes });
    });
  
    await page.route('*/**/api/auth', async (route) => {
        const method = route.request().method();

        if (method == "PUT"){

      const loginReq = { email: 'd@jwt.com', password: 'a' };
      const loginRes = { user: { id: 3, name: 'Kai Chen', email: 'd@jwt.com', roles: [{ role: 'diner' }] }, token: 'abcdef' };
      expect(route.request().method()).toBe('PUT');
      expect(route.request().postDataJSON()).toMatchObject(loginReq);
      await route.fulfill({ json: loginRes });

    }
    else if(method == "DELETE")
    {
        const loginRes = {"message":"logout successful"};
        expect(route.request().method()).toBe('DELETE');
   
        await route.fulfill({ json: loginRes });
    }
    });
  
    await page.route('*/**/api/order', async (route) => {
      const orderReq = {
        items: [
          { menuId: 1, description: 'Veggie', price: 0.0038 },
          { menuId: 2, description: 'Pepperoni', price: 0.0042 },
        ],
        storeId: '4',
        franchiseId: 2,
      };
      const orderRes = {
        order: {
          items: [
            { menuId: 1, description: 'Veggie', price: 0.0038 },
            { menuId: 2, description: 'Pepperoni', price: 0.0042 },
          ],
          storeId: '4',
          franchiseId: 2,
          id: 23,
        },
        jwt: 'eyJpYXQ',
      };
      expect(route.request().method()).toBe('POST');
      expect(route.request().postDataJSON()).toMatchObject(orderReq);
      await route.fulfill({ json: orderRes });
    });
  
    await page.goto('/');
  
    // Go to order page
    await page.getByRole('button', { name: 'Order now' }).click();
  
    // Create order
    await expect(page.locator('h2')).toContainText('Awesome is a click away');
    await page.getByRole('combobox').selectOption('4');
    await page.getByRole('link', { name: 'Image Description Veggie A' }).click();
    await page.getByRole('link', { name: 'Image Description Pepperoni' }).click();
    await expect(page.locator('form')).toContainText('Selected pizzas: 2');
    await page.getByRole('button', { name: 'Checkout' }).click();
  
    // Login
    await page.getByPlaceholder('Email address').click();
    await page.getByPlaceholder('Email address').fill('d@jwt.com');
    await page.getByPlaceholder('Email address').press('Tab');
    await page.getByPlaceholder('Password').fill('a');
    await page.getByRole('button', { name: 'Login' }).click();
  
    // Pay
    await expect(page.getByRole('main')).toContainText('Send me those 2 pizzas right now!');
    await expect(page.locator('tbody')).toContainText('Veggie');
    await expect(page.locator('tbody')).toContainText('Pepperoni');
    await expect(page.locator('tfoot')).toContainText('0.008 ₿');
    await page.getByRole('button', { name: 'Pay now' }).click();

    // Check balance
    await expect(page.getByText('0.008')).toBeVisible();
    //await page.getByRole('button', { name: 'Verify' }).click();
    //await page.getByRole('button', { name: 'Close' }).click();


    //cancel after trying to order
    await page.goto('/');
    await page.getByRole('link', { name: 'Order' }).click();
    await page.getByRole('combobox').selectOption('4');
    await page.getByRole('link', { name: 'Image Description Veggie A' }).click();
    await page.getByRole('link', { name: 'Image Description Pepperoni' }).click();
    await expect(page.locator('form')).toContainText('Selected pizzas: 2');
    await page.getByRole('button', { name: 'Checkout' }).click();

    await expect(page.getByRole('main')).toContainText('Send me those 2 pizzas right now!');
    await expect(page.locator('tbody')).toContainText('Veggie');
    await expect(page.locator('tbody')).toContainText('Pepperoni');
    await expect(page.locator('tfoot')).toContainText('0.008 ₿');
    await page.getByRole('button', { name: 'Cancel' }).click();
  

      //order more
      await page.goto('/');
      await page.getByRole('link', { name: 'Order' }).click();
      await page.getByRole('combobox').selectOption('4');
      await page.getByRole('link', { name: 'Image Description Veggie A' }).click();
      await page.getByRole('link', { name: 'Image Description Pepperoni' }).click();
      await expect(page.locator('form')).toContainText('Selected pizzas: 2');
      await page.getByRole('button', { name: 'Checkout' }).click();
  
      await expect(page.getByRole('main')).toContainText('Send me those 2 pizzas right now!');
      await expect(page.locator('tbody')).toContainText('Veggie');
      await expect(page.locator('tbody')).toContainText('Pepperoni');
      await expect(page.locator('tfoot')).toContainText('0.008 ₿');
      await page.getByRole('button', { name: 'Pay now' }).click();
      await page.getByRole('button', { name: 'Order more' }).click();

      await page.route('*/**/api/order', async (route) => {
        await route.abort('failed');
      });

      //Throw error when making payment
      await page.goto('/');
      await page.getByRole('link', { name: 'Order' }).click();
      await page.getByRole('combobox').selectOption('4');
      await page.getByRole('link', { name: 'Image Description Veggie A' }).click();
      await page.getByRole('link', { name: 'Image Description Pepperoni' }).click();
      await expect(page.locator('form')).toContainText('Selected pizzas: 2');
      await page.getByRole('button', { name: 'Checkout' }).click();
  
      await expect(page.getByRole('main')).toContainText('Send me those 2 pizzas right now!');
      await expect(page.locator('tbody')).toContainText('Veggie');
      await expect(page.locator('tbody')).toContainText('Pepperoni');
      await expect(page.locator('tfoot')).toContainText('0.008 ₿');
      await page.getByRole('button', { name: 'Pay now' }).click();

    //logout
     await page.getByRole('link', { name: 'Logout' }).click();
  });


  test("Register",async ({ page }) => {

    await page.route('*/**/api/auth', async (route) => {
        const method = route.request().method();

        if (method == "PUT"){
      const loginReq = { email: 'd@jwt.com', password: 'a' };
      const loginRes = { user: { id: 3, name: 'Kai Chen', email: 'd@jwt.com', roles: [{ role: 'diner' }] }, token: 'abcdef' };
      expect(route.request().method()).toBe('PUT');
      expect(route.request().postDataJSON()).toMatchObject(loginReq);
      await route.fulfill({ json: loginRes });
    }
    else if(method == "await page.locator('body').click();") {
        const loginRes = {"message":"logout successful"};
        expect(route.request().method()).toBe('DELETE');
        await route.fulfill({ json: loginRes });

    }
    });

    await page.goto('http://localhost:5173/');

    await page.getByRole('link', { name: 'Register' }).click();
    await page.getByPlaceholder('Full name').click();
    await page.getByPlaceholder('Full name').fill('Steph');
    await page.getByPlaceholder('Full name').press('Tab');
    await page.getByPlaceholder('Email address').fill('B@b.com');
    await page.getByPlaceholder('Password').click();
    await page.getByPlaceholder('Password').fill('123');
    await page.getByRole('button', { name: 'Register' }).click();

    await page.getByText('JWT Pizza', { exact: true }).click();
    await page.getByLabel('Global').getByRole('img').click();

    //docs for github
    await page.goto('/docs');
    //logout
    await page.getByRole('link', { name: 'Logout' });
  

  })

 



  test("Sign in as admin create a franchise than close the franchise and a store",async ({ page }) => {


    await page.route('*/**/api/auth', async (route) => {

        const method = route.request().method();

        if (method == "PUT") {

        const loginReq = { email: 'admin@jwt.com', password: 'admin' };
        const loginRes = { user: { id: 4, name: 'Adams', email: 'admin@jwt.com', roles: [{ role: 'admin' }] }, token: 'ratata' };
        expect(route.request().method()).toBe('PUT');
        expect(route.request().postDataJSON()).toMatchObject(loginReq);
        await route.fulfill({ json: loginRes });
        }
        else if(method == "DELETE") {

            const loginRes = {"message":"logout successful"};
            expect(route.request().method()).toBe('DELETE');
        
            await route.fulfill({ json: loginRes });
        }
      });

    

      await page.route('*/**/api/franchise', async (route) => {
        const method = route.request().method();

        if(method == 'GET'){
        const franchiseRes = [
            {
                "id": 2,
                "name": "test",
                "admins": [
                    {
                        "id": 4,
                        "name": "admin",
                        "email": "admin@jwt.com"
                    }
                ],
                "stores": [{
                    "id": 4,
                    "name": "SLC",
                    "totalRevenue": 0
                  }]
            },
        ];
        expect(route.request().method()).toBe('GET');
        await route.fulfill({ json: franchiseRes });
        }
        else if (method == "POST") {
            const franchiseRes = {"name": "def", "admins": [{"email": "admin@jwt.com"}]}
            expect(route.request().method()).toBe('POST');
            await route.fulfill({ json: franchiseRes });

        }
        else if(method == 'DELETE') {
            const franchiseRes = {"message": "franchise deleted"}
            expect(route.request().method()).toBe('DELETE');
            await route.fulfill({ json: franchiseRes });

        }
      });
     
      //adding franchise then deleting
      await page.goto('http://localhost:5173/');

      await page.getByLabel('Global').click();
      await page.getByRole('link', { name: 'Login' }).click();
      await page.getByPlaceholder('Email address').click();
      await page.getByPlaceholder('Email address').fill('admin@jwt.com');
      await page.getByPlaceholder('Email address').press('Tab');
      await page.getByPlaceholder('Password').click();
      await page.getByPlaceholder('Password').fill('admin');
      await page.getByRole('button', { name: 'Login' }).click();
      
      await page.getByRole('link', { name: 'Admin', exact: true }).click();

      await page.getByRole('button', { name: 'Add Franchise' }).click();
      await page.getByPlaceholder('franchise name').click();
      await page.getByPlaceholder('franchise name').fill('def');
      await page.getByPlaceholder('franchisee admin email').click();
      await page.getByPlaceholder('franchisee admin email').fill('admin@jwt.com');
      await page.getByRole('button', { name: 'Create' }).click();

      await page.getByRole('row', { name: 'test admin Close' }).getByRole('button').click();
      await page.getByRole('button', { name: 'Cancel' }).click();

      //create franchise
     
      await page.getByRole('button', { name: 'Add Franchise' }).click();
      await page.getByPlaceholder('franchise name').click();
      await page.getByPlaceholder('franchise name').fill('def');
      await page.getByPlaceholder('franchisee admin email').click();
      await page.getByPlaceholder('franchisee admin email').fill('admin@jwt.com');
      await page.getByRole('button', { name: 'Create' }).click();

      await page.getByRole('row', { name: 'test admin Close' }).getByRole('button').click();
      await page.getByRole('button', { name: 'Close' }).click();

      //click on profile
     await expect(page.getByLabel('Global')).toContainText('A');
     await page.getByRole('link', { name: 'A', exact: true }).click();

    await page.getByRole('img', { name: 'Employee stock photo' }).click();

    await expect(page.getByRole('main')).toContainText('admin@jwt.com');
    await expect(page.getByRole('main')).toContainText('Adams');
    
     //closing store within franchise but cancelling and then closing
     await page.getByRole('link', { name: 'Admin', exact: true }).click();
     await page.locator('.bg-neutral-100 > .px-6 > .px-2').click();
     await page.getByRole('button', { name: 'Cancel' }).click();
    await page.locator('.bg-neutral-100 > .px-6 > .px-2').click();
    await page.getByRole('button', { name: 'Close' }).click();


     //checking history
     await page.getByRole('link', { name: 'History' }).click();
     await page.getByRole('link', { name: 'About' }).click();
     await page.getByRole('link', { name: 'Franchise' }).click();
     await page.getByRole('link', { name: 'login' }).click();
     await page.getByPlaceholder('Email address').click();
     await page.getByPlaceholder('Email address').fill('admin@jwt.com');
     await page.getByPlaceholder('Password').click();
     await page.getByPlaceholder('Password').fill('admin');
     await page.getByRole('button', { name: 'Login' }).click();

      //posiiton of this end point is important
     await page.route('*/**/api/franchise/**', async (route) => {
        const method = route.request().method();
        console.log(route.request().url());


        if(method == 'GET'){
        const franchiseRes = [
            {
                "id": 2,
                "name": "test",
                "admins": [
                    {
                        "id": 4,
                        "name": "admin",
                        "email": "admin@jwt.com"
                    }
                ],
                "stores": [{
                    "id": 4,
                    "name": "SLC",
                    "totalRevenue": 0
                  }]
            },
        ];
         expect(route.request().method()).toBe('GET');
        await route.fulfill({ json: franchiseRes });
        }
        else if (method == 'POST') {

            const franchiseRes = 
            {"id":134,"franchiseId":177,"name":"aS"};
             expect(route.request().method()).toBe('POST');
            await route.fulfill({ json: franchiseRes });
        }
      });

      await page.getByRole('button', { name: 'Create store' }).click();
      await page.getByPlaceholder('store name').click();
      await page.getByPlaceholder('store name').fill('new store');
      await page.getByRole('button', { name: 'Create' }).click();
      await page.getByRole('button', { name: 'Close' }).click();
      
      //docs for github
      await page.goto('/docs');
          //logout
      await page.getByRole('link', { name: 'Logout' }).click();
  })
