        // ============================================
        // উন্নত ডেটা সংরক্ষণ ব্যবস্থা
        // ============================================
        class DataManager {
            constructor() {
                this.storageKey = 'saTradersData_v2';
                this.backupKey = 'saTradersBackup_v2';
                this.editingData = {
                    product: null,
                    customer: null,
                    transaction: null,
                    purchase: null
                };
                this.init();
            }
            
            init() {
                // প্রথম লোডে ডেটা চেক করুন
                if (!this.loadData()) {
                    // কোনো ডেটা না থাকলে ডিফল্ট ডেটা সেট করুন
                    this.saveDefaultData();
                }
                this.loadEditingData();
            }
            
            saveDefaultData() {
                const defaultData = {
                    customers: [],
                    products: [],
                    transactions: [],
                    purchases: [],
                    commissionRate: 0,
                    lastUpdated: new Date().toISOString(),
                    version: '2.0'
                };
                this.saveAllData(defaultData);
            }
            
            saveAllData(data) {
                try {
                    const dataToSave = {
                        ...data,
                        lastUpdated: new Date().toISOString(),
                        version: '2.0'
                    };
                    localStorage.setItem(this.storageKey, JSON.stringify(dataToSave));
                    return true;
                } catch (error) {
                    console.error('ডেটা সেভ করতে সমস্যা:', error);
                    return false;
                }
            }
            
            loadData() {
                try {
                    const data = localStorage.getItem(this.storageKey);
                    if (data) {
                        const parsedData = JSON.parse(data);
                        
                        // ডেটা ভ্যালিডেশন
                        if (this.validateData(parsedData)) {
                            return parsedData;
                        }
                    }
                    return null;
                } catch (error) {
                    console.error('ডেটা লোড করতে সমস্যা:', error);
                    return null;
                }
            }
            
            validateData(data) {
                const requiredKeys = ['customers', 'products', 'transactions', 'purchases', 'commissionRate'];
                return requiredKeys.every(key => key in data);
            }
            
            createBackup() {
                try {
                    const currentData = this.loadData();
                    if (currentData) {
                        localStorage.setItem(this.backupKey, JSON.stringify(currentData));
                        return true;
                    }
                    return false;
                } catch (error) {
                    console.error('ব্যাকআপ তৈরি করতে সমস্যা:', error);
                    return false;
                }
            }
            
            restoreFromBackup() {
                try {
                    const backupData = localStorage.getItem(this.backupKey);
                    if (backupData) {
                        const parsedData = JSON.parse(backupData);
                        if (this.validateData(parsedData)) {
                            this.saveAllData(parsedData);
                            return true;
                        }
                    }
                    return false;
                } catch (error) {
                    console.error('ব্যাকআপ থেকে রিস্টোর করতে সমস্যা:', error);
                    return false;
                }
            }
            
            exportData() {
                const data = this.loadData();
                if (data) {
                    const dataStr = JSON.stringify(data, null, 2);
                    const dataBlob = new Blob([dataStr], {type: 'application/json'});
                    const url = URL.createObjectURL(dataBlob);
                    const link = document.createElement('a');
                    link.href = url;
                    link.download = `SA_Traders_Data_${new Date().toISOString().split('T')[0]}.json`;
                    document.body.appendChild(link);
                    link.click();
                    document.body.removeChild(link);
                    URL.revokeObjectURL(url);
                    return true;
                }
                return false;
            }
            
            importData(file) {
                return new Promise((resolve, reject) => {
                    const reader = new FileReader();
                    reader.onload = (e) => {
                        try {
                            const importedData = JSON.parse(e.target.result);
                            if (this.validateData(importedData)) {
                                this.saveAllData(importedData);
                                resolve(true);
                            } else {
                                reject(new Error('ইনভ্যালিড ডেটা ফরম্যাট'));
                            }
                        } catch (error) {
                            reject(error);
                        }
                    };
                    reader.onerror = () => reject(new Error('ফাইল পড়তে সমস্যা'));
                    reader.readAsText(file);
                });
            }
            
            clearAllData() {
                try {
                    localStorage.removeItem(this.storageKey);
                    this.saveDefaultData();
                    return true;
                } catch (error) {
                    console.error('ডেটা ক্লিয়ার করতে সমস্যা:', error);
                    return false;
                }
            }
            
            // সম্পাদনা ডেটা ব্যবস্থাপনা
            setEditingData(type, data) {
                this.editingData[type] = data;
                this.saveEditingData();
            }
            
            getEditingData(type) {
                return this.editingData[type];
            }
            
            clearEditingData(type = null) {
                if (type) {
                    this.editingData[type] = null;
                } else {
                    this.editingData = {
                        product: null,
                        customer: null,
                        transaction: null,
                        purchase: null
                    };
                }
                this.saveEditingData();
            }
            
            saveEditingData() {
                try {
                    localStorage.setItem('saTradersEditingData', JSON.stringify(this.editingData));
                } catch (error) {
                    console.error('এডিটিং ডেটা সেভ করতে সমস্যা:', error);
                }
            }
            
            loadEditingData() {
                try {
                    const data = localStorage.getItem('saTradersEditingData');
                    if (data) {
                        this.editingData = JSON.parse(data);
                    }
                } catch (error) {
                    console.error('এডিটিং ডেটা লোড করতে সমস্যা:', error);
                }
            }
        }

        // গ্লোবাল ডেটা ম্যানেজার ইনস্ট্যান্স
        const dataManager = new DataManager();

        // ============================================
        // লগইন ব্যবস্থাপনা
        // ============================================
        document.getElementById('login').addEventListener('submit', function(e) {
            e.preventDefault();
            const password = document.getElementById('password').value;
            
            if (password === '884164') {
                document.getElementById('loginForm').style.display = 'none';
                document.getElementById('dashboard').style.display = 'block';
                initializeDashboard();
            } else {
                alert('ভুল পাসওয়ার্ড! সঠিক পাসওয়ার্ড দিন।');
            }
        });

        // তারিখ সেট করার ফাংশন
        function setCurrentDate() {
            const today = new Date().toISOString().split('T')[0];
            document.getElementById('purchaseProductDate').value = today;
            document.getElementById('transactionDate').value = today;
            document.getElementById('startDate').value = today;
            document.getElementById('endDate').value = today;
        }

        // লগআউট
        document.getElementById('logoutBtn').addEventListener('click', function() {
            if (confirm('আপনি কি লগআউট করতে চান?')) {
                document.getElementById('dashboard').style.display = 'none';
                document.getElementById('loginForm').style.display = 'block';
                document.getElementById('password').value = '';
                dataManager.clearEditingData();
            }
        });

        // ============================================
        // কমিশন রেট ব্যবস্থাপনা
        // ============================================
        document.getElementById('commissionForm').addEventListener('submit', function(e) {
            e.preventDefault();
            const commissionRate = parseFloat(document.getElementById('commissionRate').value) || 0;
            
            const currentData = dataManager.loadData();
            currentData.commissionRate = commissionRate;
            dataManager.saveAllData(currentData);
            
            loadCommissionRate();
            
            alert('কমিশন রেট সফলভাবে সেভ করা হয়েছে!');
        });

        // কমিশন রেট লোড করা
        function loadCommissionRate() {
            const data = dataManager.loadData();
            const commissionRate = data.commissionRate || 0;
            document.getElementById('commissionRate').value = commissionRate;
            document.getElementById('currentCommissionInfo').textContent = 
                `বর্তমান কমিশন রেট: ${formatNumber(commissionRate)} টাকা প্রতি পণ্য`;
        }

        // ============================================
        // পণ্য ব্যবস্থাপনা (সম্পাদনা ও ডিলিট সহ)
        // ============================================
        document.getElementById('productManagementForm').addEventListener('submit', function(e) {
            e.preventDefault();
            addOrUpdateProduct();
        });

        // পণ্য যোগ বা আপডেট করার ফাংশন
        function addOrUpdateProduct() {
            const productId = document.getElementById('productId').value.trim();
            const productName = document.getElementById('productName').value.trim();
            const purchasePrice = parseFloat(document.getElementById('productPurchasePrice').value) || 0;
            const sellingPrice = parseFloat(document.getElementById('productSellingPrice').value) || 0;
            const stock = parseInt(document.getElementById('productStock').value) || 0;
            const category = document.getElementById('productCategory').value.trim();
            const description = document.getElementById('productDescription').value.trim();
            
            const data = dataManager.loadData();
            const products = data.products;
            
            // এডিট মোড চেক
            const editingProduct = dataManager.getEditingData('product');
            
            if (editingProduct) {
                // বিদ্যমান পণ্য আপডেট
                const existingProductIndex = products.findIndex(p => p.id === editingProduct.id);
                if (existingProductIndex !== -1) {
                    // পুরানো স্টক রেকর্ড রাখুন
                    const oldStock = products[existingProductIndex].stock;
                    const oldTotalPurchased = products[existingProductIndex].totalPurchased;
                    const oldTotalSold = products[existingProductIndex].totalSold;
                    
                    products[existingProductIndex] = {
                        id: productId,
                        name: productName,
                        purchasePrice: purchasePrice,
                        sellingPrice: sellingPrice,
                        stock: stock,
                        totalPurchased: oldTotalPurchased + (stock - oldStock > 0 ? stock - oldStock : 0),
                        totalSold: oldTotalSold,
                        category: category,
                        description: description,
                        lastUpdated: new Date().toISOString().split('T')[0]
                    };
                    
                    alert('পণ্য সফলভাবে আপডেট করা হয়েছে!');
                }
                
                // এডিট মোড বন্ধ করুন
                dataManager.clearEditingData('product');
                resetProductForm();
            } else {
                // নতুন পণ্য যোগ
                // আইডি ডুপ্লিকেট চেক
                if (products.some(p => p.id === productId)) {
                    alert('এই পণ্য আইডি ইতিমধ্যে বিদ্যমান! দয়া করে ভিন্ন আইডি ব্যবহার করুন।');
                    return;
                }
                
                products.push({
                    id: productId,
                    name: productName,
                    purchasePrice: purchasePrice,
                    sellingPrice: sellingPrice,
                    stock: stock,
                    totalPurchased: stock,
                    totalSold: 0,
                    category: category,
                    description: description,
                    lastUpdated: new Date().toISOString().split('T')[0]
                });
                
                alert('পণ্য সফলভাবে যোগ করা হয়েছে!');
            }
            
            data.products = products;
            dataManager.saveAllData(data);
            
            // ফর্ম রিসেট
            resetProductForm();
            
            // তালিকা আপডেট
            loadProducts();
            updateProductDropdown();
            updateProfitLossSummary();
            updateDataStatus();
        }

        // পণ্য ফর্ম রিসেট
        function resetProductForm() {
            document.getElementById('productManagementForm').reset();
            document.getElementById('updateProductBtn').style.display = 'none';
            document.getElementById('cancelEditBtn').style.display = 'none';
            document.getElementById('addProductBtn').style.display = 'block';
            document.getElementById('addProductBtn').textContent = 'পণ্য যোগ করুন';
        }

        // পণ্য এডিট ফাংশন
        function editProduct(index) {
            const data = dataManager.loadData();
            const product = data.products[index];
            
            document.getElementById('productId').value = product.id;
            document.getElementById('productName').value = product.name;
            document.getElementById('productPurchasePrice').value = product.purchasePrice;
            document.getElementById('productSellingPrice').value = product.sellingPrice;
            document.getElementById('productStock').value = product.stock;
            document.getElementById('productCategory').value = product.category || '';
            document.getElementById('productDescription').value = product.description || '';
            
            document.getElementById('updateProductBtn').style.display = 'block';
            document.getElementById('cancelEditBtn').style.display = 'block';
            document.getElementById('addProductBtn').style.display = 'none';
            document.getElementById('updateProductBtn').textContent = 'পণ্য আপডেট করুন';
            
            // এডিটিং ডেটা সংরক্ষণ
            dataManager.setEditingData('product', product);
        }

        // পণ্য এডিট বাতিল
        document.getElementById('cancelEditBtn').addEventListener('click', function() {
            resetProductForm();
            dataManager.clearEditingData('product');
        });

        // পণ্য ডিলিট ফাংশন
        function deleteProduct(index) {
            if (confirm('আপনি কি এই পণ্য ডিলিট করতে চান? এই পণ্যের সাথে সম্পর্কিত সমস্ত বিক্রয় ডাটাও ডিলিট হবে!')) {
                const data = dataManager.loadData();
                const product = data.products[index];
                
                // পণ্য ডিলিট
                data.products.splice(index, 1);
                
                // এই পণ্যের সাথে সম্পর্কিত বিক্রয় ডাটা ডিলিট
                data.transactions = data.transactions.filter(t => t.productId !== product.id);
                
                dataManager.saveAllData(data);
                
                // তালিকা আপডেট
                loadProducts();
                loadTransactions();
                updateProductDropdown();
                updateProfitLossSummary();
                updateDataStatus();
                
                alert('পণ্য সফলভাবে ডিলিট করা হয়েছে!');
            }
        }

        // ============================================
        // পণ্য ক্রয় ব্যবস্থাপনা (সম্পাদনা ও ডিলিট সহ)
        // ============================================
        document.getElementById('purchaseProductForm').addEventListener('submit', function(e) {
            e.preventDefault();
            addOrUpdatePurchase();
        });

        // ক্রয় মূল্য এবং পরিমাণ পরিবর্তনে মোট মূল্য হিসাব
        document.getElementById('purchaseProductPrice').addEventListener('input', calculatePurchaseTotal);
        document.getElementById('purchaseProductQuantity').addEventListener('input', calculatePurchaseTotal);
        
        // জমা দেওয়া টাকা পরিবর্তনে বাকি টাকা হিসাব
        document.getElementById('purchasePaidAmount').addEventListener('input', calculatePurchaseDue);

        // পণ্য ক্রয় করা বা আপডেট করা
        function addOrUpdatePurchase() {
            const productId = document.getElementById('purchaseProductId').value.trim();
            const productName = document.getElementById('purchaseProductName').value.trim();
            const purchasePrice = parseFloat(document.getElementById('purchaseProductPrice').value) || 0;
            const quantity = parseInt(document.getElementById('purchaseProductQuantity').value) || 0;
            const supplier = document.getElementById('purchaseProductSupplier').value.trim();
            const totalAmount = parseFloat(document.getElementById('purchaseTotalAmount').value) || 0;
            const paidAmount = parseFloat(document.getElementById('purchasePaidAmount').value) || 0;
            const dueAmount = parseFloat(document.getElementById('purchaseDueAmount').value) || 0;
            const date = document.getElementById('purchaseProductDate').value;
            
            const data = dataManager.loadData();
            
            // এডিট মোড চেক
            const editingPurchase = dataManager.getEditingData('purchase');
            
            if (editingPurchase) {
                // বিদ্যমান ক্রয় আপডেট
                const purchases = data.purchases;
                const existingPurchaseIndex = purchases.findIndex(p => 
                    p.productId === editingPurchase.productId && 
                    p.date === editingPurchase.date &&
                    p.supplier === editingPurchase.supplier
                );
                
                if (existingPurchaseIndex !== -1) {
                    // পুরানো ক্রয় বাতিল করুন (স্টক থেকে বাদ দিন)
                    const oldPurchase = purchases[existingPurchaseIndex];
                    cancelOldPurchase(oldPurchase, data);
                    
                    // নতুন ক্রয় যোগ করুন
                    purchases[existingPurchaseIndex] = {
                        productId: productId,
                        productName: productName,
                        purchasePrice: purchasePrice,
                        quantity: quantity,
                        supplier: supplier,
                        totalAmount: totalAmount,
                        paidAmount: paidAmount,
                        dueAmount: dueAmount,
                        date: date
                    };
                    
                    // নতুন ক্রয়ের স্টক আপডেট
                    updateProductStock(productId, productName, purchasePrice, quantity, date, data);
                    
                    alert('ক্রয় সফলভাবে আপডেট করা হয়েছে!');
                }
                
                // এডিট মোড বন্ধ করুন
                dataManager.clearEditingData('purchase');
                resetPurchaseForm();
            } else {
                // নতুন ক্রয় যোগ
                const purchases = data.purchases;
                purchases.push({
                    productId: productId,
                    productName: productName,
                    purchasePrice: purchasePrice,
                    quantity: quantity,
                    supplier: supplier,
                    totalAmount: totalAmount,
                    paidAmount: paidAmount,
                    dueAmount: dueAmount,
                    date: date
                });
                data.purchases = purchases;
                
                // স্টক আপডেট
                updateProductStock(productId, productName, purchasePrice, quantity, date, data);
                
                alert('পণ্য সফলভাবে ক্রয় করা হয়েছে!');
            }
            
            dataManager.saveAllData(data);
            
            // ফর্ম রিসেট
            resetPurchaseForm();
            
            // তালিকা আপডেট
            loadProducts();
            loadPurchases();
            updateProductDropdown();
            updateProfitLossSummary();
            updateDataStatus();
        }

        // পুরানো ক্রয় বাতিল (স্টক থেকে বাদ)
        function cancelOldPurchase(purchase, data) {
            const productIndex = data.products.findIndex(p => p.id === purchase.productId);
            if (productIndex !== -1) {
                data.products[productIndex].stock -= purchase.quantity;
                data.products[productIndex].totalPurchased -= purchase.quantity;
                
                // যদি স্টক নেগেটিভ হয়, তাহলে 0 সেট করুন
                if (data.products[productIndex].stock < 0) {
                    data.products[productIndex].stock = 0;
                }
                
                if (data.products[productIndex].totalPurchased < 0) {
                    data.products[productIndex].totalPurchased = 0;
                }
            }
        }

        // ক্রয়ের মোট মূল্য হিসাব
        function calculatePurchaseTotal() {
            const price = parseFloat(document.getElementById('purchaseProductPrice').value) || 0;
            const quantity = parseInt(document.getElementById('purchaseProductQuantity').value) || 0;
            const totalAmount = price * quantity;
            
            document.getElementById('purchaseTotalAmount').value = totalAmount.toFixed(2);
            calculatePurchaseDue();
        }

        // ক্রয়ের বাকি টাকা হিসাব
        function calculatePurchaseDue() {
            const totalAmount = parseFloat(document.getElementById('purchaseTotalAmount').value) || 0;
            const paidAmount = parseFloat(document.getElementById('purchasePaidAmount').value) || 0;
            const dueAmount = totalAmount - paidAmount;
            
            document.getElementById('purchaseDueAmount').value = dueAmount.toFixed(2);
        }

        // পণ্য স্টক আপডেট
        function updateProductStock(productId, productName, purchasePrice, quantity, date, data) {
            const products = data.products;
            const existingProductIndex = products.findIndex(p => p.id === productId);
            
            if (existingProductIndex !== -1) {
                // বিদ্যমান পণ্য আপডেট
                products[existingProductIndex].stock += quantity;
                products[existingProductIndex].totalPurchased += quantity;
                products[existingProductIndex].lastUpdated = date;
            } else {
                // নতুন পণ্য যোগ
                products.push({
                    id: productId,
                    name: productName,
                    purchasePrice: purchasePrice,
                    sellingPrice: purchasePrice * 1.2, // 20% মার্জিন
                    stock: quantity,
                    totalPurchased: quantity,
                    totalSold: 0,
                    category: '',
                    description: '',
                    lastUpdated: date
                });
            }
            
            data.products = products;
        }

        // ক্রয় ফর্ম রিসেট
        function resetPurchaseForm() {
            document.getElementById('purchaseProductForm').reset();
            document.getElementById('updatePurchaseBtn').style.display = 'none';
            document.getElementById('cancelPurchaseEditBtn').style.display = 'none';
            document.getElementById('addPurchaseBtn').style.display = 'block';
            document.getElementById('addPurchaseBtn').textContent = 'পণ্য ক্রয় করুন';
            setCurrentDate();
            calculatePurchaseTotal();
        }

        // ক্রয় এডিট ফাংশন
        function editPurchase(index) {
            const data = dataManager.loadData();
            const purchase = data.purchases[index];
            
            document.getElementById('purchaseProductId').value = purchase.productId;
            document.getElementById('purchaseProductName').value = purchase.productName;
            document.getElementById('purchaseProductPrice').value = purchase.purchasePrice;
            document.getElementById('purchaseProductQuantity').value = purchase.quantity;
            document.getElementById('purchaseProductSupplier').value = purchase.supplier;
            document.getElementById('purchaseTotalAmount').value = purchase.totalAmount;
            document.getElementById('purchasePaidAmount').value = purchase.paidAmount;
            document.getElementById('purchaseDueAmount').value = purchase.dueAmount;
            document.getElementById('purchaseProductDate').value = purchase.date;
            
            document.getElementById('updatePurchaseBtn').style.display = 'block';
            document.getElementById('cancelPurchaseEditBtn').style.display = 'block';
            document.getElementById('addPurchaseBtn').style.display = 'none';
            document.getElementById('updatePurchaseBtn').textContent = 'ক্রয় আপডেট করুন';
            
            // এডিটিং ডেটা সংরক্ষণ
            dataManager.setEditingData('purchase', purchase);
        }

        // ক্রয় এডিট বাতিল
        document.getElementById('cancelPurchaseEditBtn').addEventListener('click', function() {
            resetPurchaseForm();
            dataManager.clearEditingData('purchase');
        });

        // ক্রয় ডিলিট ফাংশন
        function deletePurchase(index) {
            if (confirm('আপনি কি এই ক্রয় ডিলিট করতে চান? স্টক থেকে এই ক্রয়ের পরিমাণ বাদ দেওয়া হবে!')) {
                const data = dataManager.loadData();
                const purchase = data.purchases[index];
                
                // স্টক হ্রাস করুন
                if (purchase) {
                    const productIndex = data.products.findIndex(product => product.id === purchase.productId);
                    
                    if (productIndex !== -1) {
                        data.products[productIndex].stock -= purchase.quantity;
                        data.products[productIndex].totalPurchased -= purchase.quantity;
                        
                        // যদি স্টক 0 বা নেগেটিভ হয়, তাহলে 0 সেট করুন
                        if (data.products[productIndex].stock < 0) {
                            data.products[productIndex].stock = 0;
                        }
                        
                        if (data.products[productIndex].totalPurchased < 0) {
                            data.products[productIndex].totalPurchased = 0;
                        }
                    }
                }
                
                data.purchases.splice(index, 1);
                dataManager.saveAllData(data);
                loadPurchases();
                loadProducts();
                updateProductDropdown();
                updateProfitLossSummary();
                updateDataStatus();
                
                alert('ক্রয় সফলভাবে ডিলিট করা হয়েছে!');
            }
        }

        // ============================================
        // ক্রেতা ব্যবস্থাপনা (সম্পাদনা ও ডিলিট সহ)
        // ============================================
        document.getElementById('addCustomerForm').addEventListener('submit', function(e) {
            e.preventDefault();
            addOrUpdateCustomer();
        });

        // ক্রেতা যোগ বা আপডেট করা
        function addOrUpdateCustomer() {
            const customerId = document.getElementById('customerId').value.trim();
            const customerName = document.getElementById('customerName').value.trim();
            const customerPhone = document.getElementById('customerPhone').value.trim();
            const customerAddress = document.getElementById('customerAddress').value.trim();
            
            const data = dataManager.loadData();
            const customers = data.customers;
            
            // এডিট মোড চেক
            const editingCustomer = dataManager.getEditingData('customer');
            
            if (editingCustomer) {
                // বিদ্যমান ক্রেতা আপডেট
                const existingCustomerIndex = customers.findIndex(c => c.id === editingCustomer.id);
                if (existingCustomerIndex !== -1) {
                    customers[existingCustomerIndex] = {
                        id: customerId,
                        name: customerName,
                        phone: customerPhone,
                        address: customerAddress
                    };
                    
                    alert('ক্রেতা সফলভাবে আপডেট করা হয়েছে!');
                }
                
                // এডিট মোড বন্ধ করুন
                dataManager.clearEditingData('customer');
                resetCustomerForm();
            } else {
                // নতুন ক্রেতা যোগ
                // আইডি ডুপ্লিকেট চেক
                if (customers.some(c => c.id === customerId)) {
                    alert('এই ক্রেতা আইডি ইতিমধ্যে বিদ্যমান! দয়া করে ভিন্ন আইডি ব্যবহার করুন।');
                    return;
                }
                
                customers.push({
                    id: customerId,
                    name: customerName,
                    phone: customerPhone,
                    address: customerAddress
                });
                
                alert('ক্রেতা সফলভাবে যোগ করা হয়েছে!');
            }
            
            data.customers = customers;
            dataManager.saveAllData(data);
            
            // ফর্ম রিসেট
            resetCustomerForm();
            
            // তালিকা আপডেট
            loadCustomers();
            updateDataStatus();
        }

        // ক্রেতা ফর্ম রিসেট
        function resetCustomerForm() {
            document.getElementById('addCustomerForm').reset();
            document.getElementById('updateCustomerBtn').style.display = 'none';
            document.getElementById('cancelCustomerEditBtn').style.display = 'none';
            document.getElementById('addCustomerBtn').style.display = 'block';
            document.getElementById('addCustomerBtn').textContent = 'ক্রেতা যোগ করুন';
        }

        // ক্রেতা এডিট ফাংশন
        function editCustomer(index) {
            const data = dataManager.loadData();
            const customer = data.customers[index];
            
            document.getElementById('customerId').value = customer.id;
            document.getElementById('customerName').value = customer.name;
            document.getElementById('customerPhone').value = customer.phone || '';
            document.getElementById('customerAddress').value = customer.address || '';
            
            document.getElementById('updateCustomerBtn').style.display = 'block';
            document.getElementById('cancelCustomerEditBtn').style.display = 'block';
            document.getElementById('addCustomerBtn').style.display = 'none';
            document.getElementById('updateCustomerBtn').textContent = 'ক্রেতা আপডেট করুন';
            
            // এডিটিং ডেটা সংরক্ষণ
            dataManager.setEditingData('customer', customer);
        }

        // ক্রেতা এডিট বাতিল
        document.getElementById('cancelCustomerEditBtn').addEventListener('click', function() {
            resetCustomerForm();
            dataManager.clearEditingData('customer');
        });

        // ক্রেতা ডিলিট ফাংশন
        function deleteCustomer(index) {
            if (confirm('আপনি কি এই ক্রেতা ডিলিট করতে চান? এই ক্রেতার সাথে সম্পর্কিত সমস্ত বিক্রয় ডাটাও ডিলিট হবে!')) {
                const data = dataManager.loadData();
                const customer = data.customers[index];
                
                // ক্রেতা ডিলিট
                data.customers.splice(index, 1);
                
                // এই ক্রেতার সাথে সম্পর্কিত বিক্রয় ডাটা ডিলিট
                data.transactions = data.transactions.filter(t => t.customerId !== customer.id);
                
                dataManager.saveAllData(data);
                loadCustomers();
                loadTransactions();
                updateProfitLossSummary();
                updateDataStatus();
                
                alert('ক্রেতা সফলভাবে ডিলিট করা হয়েছে!');
            }
        }

        // ============================================
        // বিক্রয় ব্যবস্থাপনা (সম্পাদনা ও ডিলিট সহ)
        // ============================================
        // পণ্য নির্বাচন পরিবর্তন
        document.getElementById('transactionProductId').addEventListener('change', function() {
            updateProductInfo();
        });

        // পরিমাণ পরিবর্তন
        document.getElementById('transactionQuantity').addEventListener('input', function() {
            calculateTotalAmount();
            checkStockAvailability();
        });

        // বিক্রয় মূল্য পরিবর্তন
        document.getElementById('transactionUnitPrice').addEventListener('input', function() {
            calculateTotalAmount();
        });
        
        // পরিশোধিত টাকা পরিবর্তন
        document.getElementById('paidAmount').addEventListener('input', calculateDueAmount);
        
        // আজকে টাকা জমা না দেওয়ার অপশন
        document.getElementById('noPayment').addEventListener('change', function() {
            const paidAmountField = document.getElementById('paidAmount');
            if (this.checked) {
                paidAmountField.value = '0';
                paidAmountField.disabled = true;
            } else {
                paidAmountField.disabled = false;
            }
            calculateDueAmount();
        });

        // পণ্য তথ্য আপডেট
        function updateProductInfo() {
            const productId = document.getElementById('transactionProductId').value;
            const data = dataManager.loadData();
            const selectedProduct = data.products.find(product => product.id === productId);
            
            if (selectedProduct) {
                document.getElementById('productStockInfo').textContent = `স্টক: ${selectedProduct.stock}`;
                document.getElementById('productStockInfo').style.display = 'block';
                document.getElementById('transactionUnitPrice').value = selectedProduct.sellingPrice || selectedProduct.purchasePrice * 1.2;
                calculateTotalAmount();
                checkStockAvailability();
            } else {
                document.getElementById('transactionUnitPrice').value = '';
                document.getElementById('totalAmountDisplay').textContent = 'মোট মূল্য: 0 টাকা';
                document.getElementById('productStockInfo').style.display = 'none';
            }
        }

        // স্টক চেক
        function checkStockAvailability() {
            const productId = document.getElementById('transactionProductId').value;
            const quantity = parseInt(document.getElementById('transactionQuantity').value) || 0;
            const data = dataManager.loadData();
            const selectedProduct = data.products.find(product => product.id === productId);
            
            if (selectedProduct && quantity > selectedProduct.stock) {
                document.getElementById('stockError').style.display = 'block';
                return false;
            } else {
                document.getElementById('stockError').style.display = 'none';
                return true;
            }
        }

        // মোট মূল্য হিসাব
        function calculateTotalAmount() {
            const quantity = parseInt(document.getElementById('transactionQuantity').value) || 0;
            const unitPrice = parseFloat(document.getElementById('transactionUnitPrice').value) || 0;
            const totalAmount = quantity * unitPrice;
            
            document.getElementById('totalAmountDisplay').textContent = `মোট মূল্য: ${formatNumber(totalAmount)} টাকা`;
            calculateDueAmount();
        }

        // বাকি টাকা হিসাব
        function calculateDueAmount() {
            const quantity = parseInt(document.getElementById('transactionQuantity').value) || 0;
            const unitPrice = parseFloat(document.getElementById('transactionUnitPrice').value) || 0;
            const totalAmount = quantity * unitPrice;
            const paidAmount = parseFloat(document.getElementById('paidAmount').value) || 0;
            const dueAmount = totalAmount - paidAmount;
            
            document.getElementById('dueAmountDisplay').textContent = `বাকি টাকা: ${formatNumber(dueAmount)} টাকা`;
        }

        document.getElementById('addTransactionForm').addEventListener('submit', function(e) {
            e.preventDefault();
            addOrUpdateTransaction();
        });

        // বিক্রয় যোগ বা আপডেট করা
        function addOrUpdateTransaction() {
            const customerId = document.getElementById('transactionCustomerId').value.trim();
            const productId = document.getElementById('transactionProductId').value;
            const quantity = parseInt(document.getElementById('transactionQuantity').value) || 0;
            const unitPrice = parseFloat(document.getElementById('transactionUnitPrice').value) || 0;
            const totalAmount = quantity * unitPrice;
            const paidAmount = parseFloat(document.getElementById('paidAmount').value) || 0;
            const dueAmount = totalAmount - paidAmount;
            const date = document.getElementById('transactionDate').value;
            
            const data = dataManager.loadData();
            
            // ক্রেতা আইডি চেক
            const customerExists = data.customers.some(customer => customer.id === customerId);
            
            if (!customerExists) {
                document.getElementById('customerError').style.display = 'block';
                return;
            } else {
                document.getElementById('customerError').style.display = 'none';
            }
            
            // পণ্য আইডি চেক
            const productExists = data.products.some(product => product.id === productId);
            
            if (!productExists) {
                document.getElementById('productError').style.display = 'block';
                return;
            } else {
                document.getElementById('productError').style.display = 'none';
            }
            
            // স্টক চেক
            if (!checkStockAvailability()) {
                alert('স্টক পর্যাপ্ত নেই!');
                return;
            }
            
            // ক্রয় মূল্য পাওয়া
            const product = data.products.find(p => p.id === productId);
            const purchasePrice = product ? product.purchasePrice : 0;
            const profitLoss = (unitPrice - purchasePrice) * quantity;
            
            // এডিট মোড চেক
            const editingTransaction = dataManager.getEditingData('transaction');
            
            if (editingTransaction) {
                // বিদ্যমান বিক্রয় আপডেট
                const transactions = data.transactions;
                const existingTransactionIndex = transactions.findIndex(t => 
                    t.customerId === editingTransaction.customerId && 
                    t.productId === editingTransaction.productId &&
                    t.date === editingTransaction.date
                );
                
                if (existingTransactionIndex !== -1) {
                    // পুরানো বিক্রয় বাতিল করুন (স্টক ফেরত)
                    const oldTransaction = transactions[existingTransactionIndex];
                    cancelOldTransaction(oldTransaction, data);
                    
                    // নতুন বিক্রয় যোগ করুন
                    const productIndex = data.products.findIndex(product => product.id === productId);
                    if (productIndex !== -1 && data.products[productIndex].stock >= quantity) {
                        data.products[productIndex].stock -= quantity;
                        data.products[productIndex].totalSold += quantity;
                        data.products[productIndex].lastUpdated = date;
                    }
                    
                    transactions[existingTransactionIndex] = {
                        customerId: customerId,
                        productId: productId,
                        quantity: quantity,
                        unitPrice: unitPrice,
                        purchasePrice: purchasePrice,
                        profitLoss: profitLoss,
                        totalAmount: totalAmount,
                        paidAmount: paidAmount,
                        dueAmount: dueAmount,
                        date: date,
                        type: 'sale'
                    };
                    
                    alert('বিক্রয় সফলভাবে আপডেট করা হয়েছে!');
                }
                
                // এডিট মোড বন্ধ করুন
                dataManager.clearEditingData('transaction');
                resetTransactionForm();
            } else {
                // স্টক আপডেট
                const productIndex = data.products.findIndex(product => product.id === productId);
                if (productIndex !== -1 && data.products[productIndex].stock >= quantity) {
                    data.products[productIndex].stock -= quantity;
                    data.products[productIndex].totalSold += quantity;
                    data.products[productIndex].lastUpdated = date;
                } else {
                    alert('স্টক পর্যাপ্ত নেই!');
                    return;
                }
                
                // নতুন বিক্রয় যোগ
                const transactions = data.transactions;
                transactions.push({
                    customerId: customerId,
                    productId: productId,
                    quantity: quantity,
                    unitPrice: unitPrice,
                    purchasePrice: purchasePrice,
                    profitLoss: profitLoss,
                    totalAmount: totalAmount,
                    paidAmount: paidAmount,
                    dueAmount: dueAmount,
                    date: date,
                    type: 'sale'
                });
                data.transactions = transactions;
                
                alert('বিক্রয় সফলভাবে সম্পন্ন হয়েছে!');
            }
            
            dataManager.saveAllData(data);
            
            // ফর্ম রিসেট
            resetTransactionForm();
            
            // তালিকা আপডেট
            loadProducts();
            loadTransactions();
            updateProductDropdown();
            updateProfitLossSummary();
            updateDataStatus();
        }

        // পুরানো বিক্রয় বাতিল (স্টক ফেরত)
        function cancelOldTransaction(transaction, data) {
            const productIndex = data.products.findIndex(product => product.id === transaction.productId);
            if (productIndex !== -1) {
                data.products[productIndex].stock += transaction.quantity;
                data.products[productIndex].totalSold -= transaction.quantity;
                
                if (data.products[productIndex].totalSold < 0) {
                    data.products[productIndex].totalSold = 0;
                }
            }
        }

        // বিক্রয় ফর্ম রিসেট
        function resetTransactionForm() {
            document.getElementById('addTransactionForm').reset();
            document.getElementById('updateTransactionBtn').style.display = 'none';
            document.getElementById('cancelTransactionEditBtn').style.display = 'none';
            document.getElementById('addTransactionBtn').style.display = 'block';
            document.getElementById('addTransactionBtn').textContent = 'বিক্রয় সম্পন্ন করুন';
            document.getElementById('transactionUnitPrice').value = '';
            document.getElementById('totalAmountDisplay').textContent = 'মোট মূল্য: 0 টাকা';
            document.getElementById('dueAmountDisplay').textContent = 'বাকি টাকা: 0 টাকা';
            document.getElementById('noPayment').checked = false;
            document.getElementById('paidAmount').disabled = false;
            document.getElementById('productStockInfo').style.display = 'none';
            setCurrentDate();
            updateProductDropdown();
        }

        // বিক্রয় এডিট ফাংশন
        function editTransaction(index) {
            const data = dataManager.loadData();
            const transaction = data.transactions[index];
            
            document.getElementById('transactionCustomerId').value = transaction.customerId;
            document.getElementById('transactionProductId').value = transaction.productId;
            document.getElementById('transactionQuantity').value = transaction.quantity;
            document.getElementById('transactionUnitPrice').value = transaction.unitPrice;
            document.getElementById('paidAmount').value = transaction.paidAmount;
            document.getElementById('transactionDate').value = transaction.date;
            
            // পণ্য তথ্য আপডেট
            updateProductInfo();
            calculateTotalAmount();
            
            document.getElementById('updateTransactionBtn').style.display = 'block';
            document.getElementById('cancelTransactionEditBtn').style.display = 'block';
            document.getElementById('addTransactionBtn').style.display = 'none';
            document.getElementById('updateTransactionBtn').textContent = 'বিক্রয় আপডেট করুন';
            
            // এডিটিং ডেটা সংরক্ষণ
            dataManager.setEditingData('transaction', transaction);
        }

        // বিক্রয় এডিট বাতিল
        document.getElementById('cancelTransactionEditBtn').addEventListener('click', function() {
            resetTransactionForm();
            dataManager.clearEditingData('transaction');
        });

        // বিক্রয় ডিলিট ফাংশন
        function deleteTransaction(index) {
            if (confirm('আপনি কি এই বিক্রয় ডিলিট করতে চান? স্টক ফেরত দেওয়া হবে!')) {
                const data = dataManager.loadData();
                const transaction = data.transactions[index];
                
                // স্টক ফেরত দিন
                if (transaction) {
                    const productIndex = data.products.findIndex(product => product.id === transaction.productId);
                    
                    if (productIndex !== -1) {
                        data.products[productIndex].stock += transaction.quantity;
                        data.products[productIndex].totalSold -= transaction.quantity;
                        
                        if (data.products[productIndex].totalSold < 0) {
                            data.products[productIndex].totalSold = 0;
                        }
                    }
                }
                
                data.transactions.splice(index, 1);
                dataManager.saveAllData(data);
                loadTransactions();
                loadProducts();
                updateProductDropdown();
                updateProfitLossSummary();
                updateDataStatus();
                
                alert('বিক্রয় সফলভাবে ডিলিট করা হয়েছে!');
            }
        }

        // ============================================
        // ডেটা লোড এবং ডিসপ্লে ফাংশন
        // ============================================
        // পণ্যের তালিকা লোড করা
        function loadProducts() {
            const data = dataManager.loadData();
            const products = data.products;
            const productsList = document.getElementById('productsList');
            productsList.innerHTML = '';
            
            let totalProducts = 0;
            let totalStockQuantity = 0;
            let totalStockValue = 0;
            let lowStockProducts = 0;
            
            products.forEach((product, index) => {
                const stockValue = product.stock * product.purchasePrice;
                const stockStatus = getStockStatus(product.stock);
                
                totalProducts++;
                totalStockQuantity += product.stock;
                totalStockValue += stockValue;
                
                if (product.stock <= 10) {
                    lowStockProducts++;
                }
                
                const row = document.createElement('tr');
                row.innerHTML = `
                    <td>${product.id}</td>
                    <td>${product.name}</td>
                    <td>${formatNumber(product.purchasePrice)} টাকা</td>
                    <td>${formatNumber(product.sellingPrice || (product.purchasePrice * 1.2))} টাকা</td>
                    <td>${product.stock}</td>
                    <td class="${stockStatus.class}">${stockStatus.text}</td>
                    <td>${product.totalPurchased || 0}</td>
                    <td>${product.totalSold || 0}</td>
                    <td>${formatNumber(stockValue)} টাকা</td>
                    <td>${product.category || '-'}</td>
                    <td>
                        <button class="edit-btn" onclick="editProduct(${index})">এডিট</button>
                        <button class="delete-btn" onclick="deleteProduct(${index})">ডিলিট</button>
                    </td>
                `;
                productsList.appendChild(row);
            });
            
            // সারাংশ আপডেট
            document.getElementById('totalProducts').textContent = `${totalProducts} টি`;
            document.getElementById('totalStockQuantity').textContent = totalStockQuantity;
            document.getElementById('totalStockValue').textContent = `${formatNumber(totalStockValue)} টাকা`;
            document.getElementById('lowStockProducts').textContent = `${lowStockProducts} টি`;
        }

        // স্টক স্ট্যাটাস নির্ধারণ
        function getStockStatus(stock) {
            if (stock === 0) {
                return { class: 'stock-low', text: 'স্টক নেই' };
            } else if (stock <= 10) {
                return { class: 'stock-low', text: 'নিম্ন স্টক' };
            } else if (stock <= 25) {
                return { class: 'stock-medium', text: 'মধ্যম স্টক' };
            } else {
                return { class: 'stock-high', text: 'পর্যাপ্ত স্টক' };
            }
        }

        // লাভ-ক্ষতি সারাংশ আপডেট
        function updateProfitLossSummary() {
            const data = dataManager.loadData();
            const transactions = data.transactions;
            const purchases = data.purchases;
            const commissionRate = data.commissionRate || 0;
            
            let totalPurchaseValue = 0;
            let totalSalesValue = 0;
            let totalCommission = 0;
            let totalProfitLoss = 0;
            
            // মোট ক্রয় মূল্য হিসাব
            purchases.forEach(purchase => {
                totalPurchaseValue += purchase.totalAmount || 0;
            });
            
            // মোট বিক্রয় মূল্য ও লাভ-ক্ষতি হিসাব
            transactions.forEach(transaction => {
                totalSalesValue += transaction.totalAmount || 0;
                totalCommission += (transaction.quantity || 0) * commissionRate;
                totalProfitLoss += transaction.profitLoss || 0;
            });
            
            // লাভ-ক্ষতি শতাংশ
            const profitLossPercentage = totalPurchaseValue > 0 ? 
                ((totalProfitLoss / totalPurchaseValue) * 100).toFixed(2) : 0;
            
            // UI আপডেট
            document.getElementById('totalPurchaseValue').textContent = `${formatNumber(totalPurchaseValue)} টাকা`;
            document.getElementById('totalSalesValue').textContent = `${formatNumber(totalSalesValue)} টাকা`;
            document.getElementById('totalCommissionValue').textContent = `${formatNumber(totalCommission)} টাকা`;
            
            const profitLossElement = document.getElementById('totalProfitLoss');
            profitLossElement.textContent = `${formatNumber(totalProfitLoss)} টাকা`;
            
            // রঙ নির্ধারণ
            if (totalProfitLoss > 0) {
                profitLossElement.className = 'profit-positive';
            } else if (totalProfitLoss < 0) {
                profitLossElement.className = 'profit-negative';
            } else {
                profitLossElement.className = 'profit-neutral';
            }
            
            document.getElementById('profitLossPercentage').textContent = `${profitLossPercentage}%`;
        }

        // ক্রেতাদের তালিকা লোড করা
        function loadCustomers() {
            const data = dataManager.loadData();
            const customers = data.customers;
            const customersList = document.getElementById('customersList');
            customersList.innerHTML = '';
            
            customers.forEach((customer, index) => {
                const row = document.createElement('tr');
                row.innerHTML = `
                    <td>${customer.id}</td>
                    <td>${customer.name}</td>
                    <td>${customer.phone}</td>
                    <td>${customer.address}</td>
                    <td>
                        <button class="edit-btn" onclick="editCustomer(${index})">এডিট</button>
                        <button class="delete-btn" onclick="deleteCustomer(${index})">ডিলিট</button>
                    </td>
                `;
                customersList.appendChild(row);
            });
        }

        // বিক্রয়ের তালিকা লোড করা
        function loadTransactions() {
            const data = dataManager.loadData();
            const transactions = data.transactions;
            const transactionsList = document.getElementById('transactionsList');
            transactionsList.innerHTML = '';
            
            transactions.forEach((transaction, index) => {
                const profitLossClass = transaction.profitLoss > 0 ? 'profit-positive' : 
                                      transaction.profitLoss < 0 ? 'profit-negative' : 'profit-neutral';
                
                const row = document.createElement('tr');
                row.innerHTML = `
                    <td>${transaction.date}</td>
                    <td>${transaction.customerId}</td>
                    <td>${getProductName(transaction.productId)}</td>
                    <td>${transaction.quantity}</td>
                    <td>${formatNumber(transaction.purchasePrice)} টাকা</td>
                    <td>${formatNumber(transaction.unitPrice)} টাকা</td>
                    <td class="${profitLossClass}">${formatNumber(transaction.profitLoss)} টাকা</td>
                    <td>${formatNumber(transaction.totalAmount)} টাকা</td>
                    <td>${formatNumber(transaction.paidAmount)} টাকা</td>
                    <td>${formatNumber(transaction.dueAmount)} টাকা</td>
                    <td>
                        <button class="edit-btn" onclick="editTransaction(${index})">এডিট</button>
                        <button class="delete-btn" onclick="deleteTransaction(${index})">ডিলিট</button>
                    </td>
                `;
                transactionsList.appendChild(row);
            });
        }

        // ক্রয়ের তালিকা লোড করা
        function loadPurchases() {
            const data = dataManager.loadData();
            const purchases = data.purchases;
            const purchasesList = document.getElementById('purchasesList');
            purchasesList.innerHTML = '';
            
            purchases.forEach((purchase, index) => {
                const row = document.createElement('tr');
                row.innerHTML = `
                    <td>${purchase.date}</td>
                    <td>${purchase.productId}</td>
                    <td>${purchase.productName}</td>
                    <td>${purchase.supplier}</td>
                    <td>${purchase.quantity}</td>
                    <td>${formatNumber(purchase.purchasePrice)} টাকা</td>
                    <td>${formatNumber(purchase.totalAmount)} টাকা</td>
                    <td>${formatNumber(purchase.paidAmount)} টাকা</td>
                    <td>${formatNumber(purchase.dueAmount)} টাকা</td>
                    <td>
                        <button class="edit-btn" onclick="editPurchase(${index})">এডিট</button>
                        <button class="delete-btn" onclick="deletePurchase(${index})">ডিলিট</button>
                    </td>
                `;
                purchasesList.appendChild(row);
            });
        }

        // পণ্য আইডি থেকে পণ্যের নাম পাওয়া
        function getProductName(productId) {
            const data = dataManager.loadData();
            const product = data.products.find(p => p.id === productId);
            return product ? product.name : productId;
        }

        // ক্রেতা আইডি থেকে ক্রেতার নাম পাওয়া
        function getCustomerName(customerId) {
            const data = dataManager.loadData();
            const customer = data.customers.find(c => c.id === customerId);
            return customer ? customer.name : 'নাম পাওয়া যায়নি';
        }

        // পণ্য ড্রপডাউন আপডেট
        function updateProductDropdown() {
            const data = dataManager.loadData();
            const products = data.products;
            const productDropdown = document.getElementById('transactionProductId');
            
            // বর্তমান নির্বাচিত মান সংরক্ষণ
            const currentValue = productDropdown.value;
            
            // অপশনগুলি আপডেট
            productDropdown.innerHTML = '<option value="">পণ্য নির্বাচন করুন</option>';
            
            products.forEach(product => {
                if (product.stock > 0) {
                    const option = document.createElement('option');
                    option.value = product.id;
                    option.textContent = `${product.name} (ক্রয়: ${formatNumber(product.purchasePrice)} টাকা) - স্টক: ${product.stock}`;
                    productDropdown.appendChild(option);
                }
            });
            
            // পূর্বের নির্বাচিত মান পুনরায় সেট করুন
            if (currentValue) {
                productDropdown.value = currentValue;
            }
        }

        // ============================================
        // স্টেটমেন্ট ও রিপোর্ট ব্যবস্থাপনা
        // ============================================
        // স্টেটমেন্ট অপশন পরিবর্তন
        document.getElementById('statementPeriod').addEventListener('change', function() {
            const customDateRange = document.getElementById('customDateRange');
            if (this.value === 'custom') {
                customDateRange.style.display = 'block';
            } else {
                customDateRange.style.display = 'none';
            }
        });

        // সংখ্যা ফরম্যাটিং ফাংশন
        function formatNumber(num) {
            if (num === undefined || num === null || isNaN(num)) {
                return '0';
            }
            return parseFloat(num).toFixed(2).replace(/\d(?=(\d{3})+\.)/g, '$&,');
        }

        // ক্রেতা স্টেটমেন্ট তৈরি
        document.getElementById('generateCustomerStatementBtn').addEventListener('click', function() {
            const customerId = document.getElementById('statementCustomerId').value;
            const period = document.getElementById('statementPeriod').value;
            const startDate = document.getElementById('startDate').value;
            const endDate = document.getElementById('endDate').value;
            
            const data = dataManager.loadData();
            let filteredTransactions = data.transactions;
            
            // ক্রেতা আইডি অনুযায়ী ফিল্টার
            if (customerId) {
                filteredTransactions = filteredTransactions.filter(t => t.customerId === customerId);
            }
            
            // তারিখ অনুযায়ী ফিল্টার
            filteredTransactions = filterByDate(filteredTransactions, period, startDate, endDate);
            
            // কমিশন রেট পাওয়া
            const commissionRate = data.commissionRate || 0;
            
            // ক্রেতার নাম পাওয়া
            const customerName = customerId ? getCustomerName(customerId) : 'সমস্ত ক্রেতা';
            
            // স্টেটমেন্ট তৈরি
            let statementHTML = createStatementHeader('ক্রেতা বিক্রয় বিবরণী');
            statementHTML += `
                <div style="margin-bottom: 20px; padding: 15px; background: #f8f9fa; border-radius: 8px; border: 1px solid #ddd;">
                    <p style="margin: 5px 0;"><strong>ক্রেতা:</strong> ${customerName} ${customerId ? '(আইডি: ' + customerId + ')' : ''}</p>
                    <p style="margin: 5px 0;"><strong>সময়কাল:</strong> ${getPeriodText(period, startDate, endDate)}</p>
                </div>
                
                <table class="excel-table">
                    <thead>
                        <tr>
                            <th>তারিখ</th>
                            <th>ক্রেতা আইডি</th>
                            <th>ক্রেতার নাম</th>
                            <th>পণ্য</th>
                            <th>পরিমাণ</th>
                            <th>মোট মূল্য</th>
                            <th>জমা</th>
                            <th>বাকি</th>
                            <th>কমিশন</th>
                        </tr>
                    </thead>
                    <tbody>
            `;
            
            let totalSales = 0;
            let totalPaid = 0;
            let totalDue = 0;
            let totalCommission = 0;
            
            if (filteredTransactions.length === 0) {
                statementHTML += `
                    <tr>
                        <td colspan="9" style="text-align: center; padding: 20px; color: #666;">
                            এই সময়কালে কোনো বিক্রয় লেনদেন পাওয়া যায়নি
                        </td>
                    </tr>
                `;
            } else {
                filteredTransactions.forEach(transaction => {
                    const commission = transaction.quantity * commissionRate;
                    totalSales += transaction.totalAmount || 0;
                    totalPaid += transaction.paidAmount || 0;
                    totalDue += transaction.dueAmount || 0;
                    totalCommission += commission || 0;
                    
                    statementHTML += `
                        <tr>
                            <td>${transaction.date}</td>
                            <td>${transaction.customerId}</td>
                            <td>${getCustomerName(transaction.customerId)}</td>
                            <td>${getProductName(transaction.productId)}</td>
                            <td>${transaction.quantity}</td>
                            <td>${formatNumber(transaction.totalAmount)} টাকা</td>
                            <td>${formatNumber(transaction.paidAmount)} টাকা</td>
                            <td>${formatNumber(transaction.dueAmount)} টাকা</td>
                            <td>${formatNumber(commission)} টাকা</td>
                        </tr>
                    `;
                });
            }
            
            statementHTML += `
                    </tbody>
                </table>
                
                <div class="summary-box" style="border: 2px solid #2a5298; background: linear-gradient(135deg, #f8f9fa, #e8f4f8);">
                    <h4 style="text-align: center; margin-bottom: 15px; color: #2a5298; border-bottom: 1px solid #2a5298; padding-bottom: 5px;">সারসংক্ষেপ</h4>
                    <div class="summary-item">
                        <span>মোট বিক্রয়:</span>
                        <span>${formatNumber(totalSales)} টাকা</span>
                    </div>
                    <div class="summary-item">
                        <span>মোট জমা:</span>
                        <span>${formatNumber(totalPaid)} টাকা</span>
                    </div>
                    <div class="summary-item">
                        <span>মোট বাকি:</span>
                        <span>${formatNumber(totalDue)} টাকা</span>
                    </div>
                    <div class="summary-item">
                        <span>মোট কমিশন:</span>
                        <span>${formatNumber(totalCommission)} টাকা</span>
                    </div>
                </div>
            </div>
            `;
            
            document.getElementById('statementResult').innerHTML = statementHTML;
            showStatementActions();
        });

        // পণ্য বিক্রয় স্টেটমেন্ট তৈরি
        document.getElementById('generateProductStatementBtn').addEventListener('click', function() {
            const period = document.getElementById('statementPeriod').value;
            const startDate = document.getElementById('startDate').value;
            const endDate = document.getElementById('endDate').value;
            
            const data = dataManager.loadData();
            let filteredTransactions = filterByDate(data.transactions, period, startDate, endDate);
            
            // পণ্য অনুযায়ী গ্রুপ করা
            const productSales = {};
            filteredTransactions.forEach(transaction => {
                if (!productSales[transaction.productId]) {
                    productSales[transaction.productId] = {
                        name: getProductName(transaction.productId),
                        totalQuantity: 0,
                        totalAmount: 0
                    };
                }
                productSales[transaction.productId].totalQuantity += transaction.quantity || 0;
                productSales[transaction.productId].totalAmount += transaction.totalAmount || 0;
            });
            
            // কমিশন রেট পাওয়া
            const commissionRate = data.commissionRate || 0;
            
            // স্টেটমেন্ট তৈরি
            let statementHTML = createStatementHeader('পণ্য বিক্রয় বিবরণী');
            statementHTML += `
                <div style="margin-bottom: 20px; padding: 15px; background: #f8f9fa; border-radius: 8px; border: 1px solid #ddd;">
                    <p style="margin: 5px 0;"><strong>সময়কাল:</strong> ${getPeriodText(period, startDate, endDate)}</p>
                </div>
                
                <table class="excel-table">
                    <thead>
                        <tr>
                            <th>পণ্য আইডি</th>
                            <th>পণ্যের নাম</th>
                            <th>মোট বিক্রয় পরিমাণ</th>
                            <th>মোট বিক্রয় মূল্য</th>
                            <th>মোট কমিশন</th>
                        </tr>
                    </thead>
                    <tbody>
            `;
            
            let totalSales = 0;
            let totalCommission = 0;
            
            if (Object.keys(productSales).length === 0) {
                statementHTML += `
                    <tr>
                        <td colspan="5" style="text-align: center; padding: 20px; color: #666;">
                            এই সময়কালে কোনো পণ্য বিক্রয় পাওয়া যায়নি
                        </td>
                    </tr>
                `;
            } else {
                Object.keys(productSales).forEach(productId => {
                    const product = productSales[productId];
                    const commission = product.totalQuantity * commissionRate;
                    totalSales += product.totalAmount || 0;
                    totalCommission += commission || 0;
                    
                    statementHTML += `
                        <tr>
                            <td>${productId}</td>
                            <td>${product.name}</td>
                            <td>${product.totalQuantity}</td>
                            <td>${formatNumber(product.totalAmount)} টাকা</td>
                            <td>${formatNumber(commission)} টাকা</td>
                        </tr>
                    `;
                });
            }
            
            statementHTML += `
                    </tbody>
                </table>
                
                <div class="summary-box" style="border: 2px solid #2a5298; background: linear-gradient(135deg, #f8f9fa, #e8f4f8);">
                    <h4 style="text-align: center; margin-bottom: 15px; color: #2a5298; border-bottom: 1px solid #2a5298; padding-bottom: 5px;">সারসংক্ষেপ</h4>
                    <div class="summary-item">
                        <span>মোট বিক্রয়:</span>
                        <span>${formatNumber(totalSales)} টাকা</span>
                    </div>
                    <div class="summary-item">
                        <span>মোট কমিশন:</span>
                        <span>${formatNumber(totalCommission)} টাকা</span>
                    </div>
                </div>
            </div>
            `;
            
            document.getElementById('statementResult').innerHTML = statementHTML;
            showStatementActions();
        });

        // পণ্য ক্রয় স্টেটমেন্ট তৈরি
        document.getElementById('generatePurchaseStatementBtn').addEventListener('click', function() {
            const period = document.getElementById('statementPeriod').value;
            const startDate = document.getElementById('startDate').value;
            const endDate = document.getElementById('endDate').value;
            
            const data = dataManager.loadData();
            let filteredPurchases = filterByDate(data.purchases, period, startDate, endDate, 'purchase');
            
            // সাপ্লাইয়ার অনুযায়ী গ্রুপ করা
            const supplierAnalysis = {};
            filteredPurchases.forEach(purchase => {
                if (!supplierAnalysis[purchase.supplier]) {
                    supplierAnalysis[purchase.supplier] = {
                        totalAmount: 0,
                        totalPaid: 0,
                        totalDue: 0,
                        purchaseCount: 0
                    };
                }
                supplierAnalysis[purchase.supplier].totalAmount += purchase.totalAmount || 0;
                supplierAnalysis[purchase.supplier].totalPaid += purchase.paidAmount || 0;
                supplierAnalysis[purchase.supplier].totalDue += purchase.dueAmount || 0;
                supplierAnalysis[purchase.supplier].purchaseCount += 1;
            });
            
            // স্টেটমেন্ট তৈরি
            let statementHTML = createStatementHeader('পণ্য ক্রয় বিবরণী');
            statementHTML += `
                <div style="margin-bottom: 20px; padding: 15px; background: #f8f9fa; border-radius: 8px; border: 1px solid #ddd;">
                    <p style="margin: 5px 0;"><strong>সময়কাল:</strong> ${getPeriodText(period, startDate, endDate)}</p>
                </div>
                
                <h4 style="color: #2a5298; margin-bottom: 15px; border-bottom: 1px solid #2a5298; padding-bottom: 5px;">সাপ্লাইয়ার অনুযায়ী ক্রয় বিবরণী</h4>
                <table class="excel-table">
                    <thead>
                        <tr>
                            <th>সাপ্লাইয়ার</th>
                            <th>ক্রয় সংখ্যা</th>
                            <th>মোট ক্রয় মূল্য</th>
                            <th>মোট জমা</th>
                            <th>মোট বাকি</th>
                        </tr>
                    </thead>
                    <tbody>
            `;
            
            let totalPurchaseValue = 0;
            let totalPaidAmount = 0;
            let totalDueAmount = 0;
            let totalPurchaseCount = 0;
            
            if (Object.keys(supplierAnalysis).length === 0) {
                statementHTML += `
                    <tr>
                        <td colspan="5" style="text-align: center; padding: 20px; color: #666;">
                            এই সময়কালে কোনো ক্রয় লেনদেন পাওয়া যায়নি
                        </td>
                    </tr>
                `;
            } else {
                Object.keys(supplierAnalysis).forEach(supplier => {
                    const data = supplierAnalysis[supplier];
                    totalPurchaseValue += data.totalAmount || 0;
                    totalPaidAmount += data.totalPaid || 0;
                    totalDueAmount += data.totalDue || 0;
                    totalPurchaseCount += data.purchaseCount || 0;
                    
                    statementHTML += `
                        <tr>
                            <td>${supplier}</td>
                            <td>${data.purchaseCount}</td>
                            <td>${formatNumber(data.totalAmount)} টাকা</td>
                            <td>${formatNumber(data.totalPaid)} টাকা</td>
                            <td>${formatNumber(data.totalDue)} টাকা</td>
                        </tr>
                    `;
                });
            }
            
            statementHTML += `
                    </tbody>
                </table>
                
                <h4 style="color: #2a5298; margin-top: 20px; margin-bottom: 15px; border-bottom: 1px solid #2a5298; padding-bottom: 5px;">বিস্তারিত ক্রয় তালিকা</h4>
                <table class="excel-table">
                    <thead>
                        <tr>
                            <th>ক্রয় তারিখ</th>
                            <th>পণ্য আইডি</th>
                            <th>পণ্যের নাম</th>
                            <th>সাপ্লাইয়ার</th>
                            <th>পরিমাণ</th>
                            <th>ক্রয় মূল্য</th>
                            <th>মোট মূল্য</th>
                            <th>জমা</th>
                            <th>বাকি</th>
                        </tr>
                    </thead>
                    <tbody>
            `;
            
            filteredPurchases.forEach(purchase => {
                statementHTML += `
                    <tr>
                        <td>${purchase.date}</td>
                        <td>${purchase.productId}</td>
                        <td>${purchase.productName}</td>
                        <td>${purchase.supplier}</td>
                        <td>${purchase.quantity}</td>
                        <td>${formatNumber(purchase.purchasePrice)} টাকা</td>
                        <td>${formatNumber(purchase.totalAmount)} টাকা</td>
                        <td>${formatNumber(purchase.paidAmount)} টাকা</td>
                        <td>${formatNumber(purchase.dueAmount)} টাকা</td>
                    </tr>
                `;
            });
            
            statementHTML += `
                    </tbody>
                </table>
                
                <div class="summary-box" style="border: 2px solid #2a5298; background: linear-gradient(135deg, #f8f9fa, #e8f4f8); margin-top: 20px;">
                    <h4 style="text-align: center; margin-bottom: 15px; color: #2a5298; border-bottom: 1px solid #2a5298; padding-bottom: 5px;">সারসংক্ষেপ</h4>
                    <div class="summary-item">
                        <span>মোট ক্রয়:</span>
                        <span>${totalPurchaseCount} টি</span>
                    </div>
                    <div class="summary-item">
                        <span>মোট ক্রয় মূল্য:</span>
                        <span>${formatNumber(totalPurchaseValue)} টাকা</span>
                    </div>
                    <div class="summary-item">
                        <span>মোট জমা:</span>
                        <span>${formatNumber(totalPaidAmount)} টাকা</span>
                    </div>
                    <div class="summary-item">
                        <span>মোট বাকি:</span>
                        <span>${formatNumber(totalDueAmount)} টাকা</span>
                    </div>
                </div>
            </div>
            `;
            
            document.getElementById('statementResult').innerHTML = statementHTML;
            showStatementActions();
        });

        // লাভ-ক্ষতি স্টেটমেন্ট তৈরি
        document.getElementById('generateProfitLossStatementBtn').addEventListener('click', function() {
            const period = document.getElementById('statementPeriod').value;
            const startDate = document.getElementById('startDate').value;
            const endDate = document.getElementById('endDate').value;
            
            const data = dataManager.loadData();
            const commissionRate = data.commissionRate || 0;
            
            let filteredTransactions = filterByDate(data.transactions, period, startDate, endDate);
            let filteredPurchases = filterByDate(data.purchases, period, startDate, endDate, 'purchase');
            
            let totalPurchaseValue = 0;
            let totalSalesValue = 0;
            let totalCommission = 0;
            let totalProfitLoss = 0;
            
            // মোট ক্রয় মূল্য হিসাব
            filteredPurchases.forEach(purchase => {
                totalPurchaseValue += purchase.totalAmount || 0;
            });
            
            // মোট বিক্রয় মূল্য ও লাভ-ক্ষতি হিসাব
            filteredTransactions.forEach(transaction => {
                totalSalesValue += transaction.totalAmount || 0;
                totalCommission += (transaction.quantity || 0) * commissionRate;
                totalProfitLoss += transaction.profitLoss || 0;
            });
            
            // লাভ-ক্ষতি শতাংশ
            const profitLossPercentage = totalPurchaseValue > 0 ? 
                ((totalProfitLoss / totalPurchaseValue) * 100).toFixed(2) : 0;
            
            // পণ্য অনুযায়ী লাভ-ক্ষতি বিশ্লেষণ
            const productAnalysis = {};
            filteredTransactions.forEach(transaction => {
                if (!productAnalysis[transaction.productId]) {
                    productAnalysis[transaction.productId] = {
                        name: getProductName(transaction.productId),
                        totalQuantity: 0,
                        totalSales: 0,
                        totalProfitLoss: 0
                    };
                }
                productAnalysis[transaction.productId].totalQuantity += transaction.quantity || 0;
                productAnalysis[transaction.productId].totalSales += transaction.totalAmount || 0;
                productAnalysis[transaction.productId].totalProfitLoss += transaction.profitLoss || 0;
            });
            
            // স্টেটমেন্ট তৈরি
            let statementHTML = createStatementHeader('লাভ-ক্ষতি বিবরণী');
            statementHTML += `
                <div style="margin-bottom: 20px; padding: 15px; background: #f8f9fa; border-radius: 8px; border: 1px solid #ddd;">
                    <p style="margin: 5px 0;"><strong>সময়কাল:</strong> ${getPeriodText(period, startDate, endDate)}</p>
                </div>
                
                <div class="summary-box" style="border: 2px solid #2a5298; background: linear-gradient(135deg, #f8f9fa, #e8f4f8); margin-bottom: 20px;">
                    <h4 style="text-align: center; margin-bottom: 15px; color: #2a5298; border-bottom: 1px solid #2a5298; padding-bottom: 5px;">আর্থিক সারাংশ</h4>
                    <div class="summary-item">
                        <span>মোট ক্রয় মূল্য:</span>
                        <span>${formatNumber(totalPurchaseValue)} টাকা</span>
                    </div>
                    <div class="summary-item">
                        <span>মোট বিক্রয় মূল্য:</span>
                        <span>${formatNumber(totalSalesValue)} টাকা</span>
                    </div>
                    <div class="summary-item">
                        <span>মোট কমিশন:</span>
                        <span>${formatNumber(totalCommission)} টাকা</span>
                    </div>
                    <div class="summary-item" style="${totalProfitLoss > 0 ? 'color: #28a745;' : totalProfitLoss < 0 ? 'color: #dc3545;' : ''}">
                        <span>মোট লাভ/ক্ষতি:</span>
                        <span>${formatNumber(totalProfitLoss)} টাকা</span>
                    </div>
                    <div class="summary-item" style="${totalProfitLoss > 0 ? 'color: #28a745;' : totalProfitLoss < 0 ? 'color: #dc3545;' : ''}">
                        <span>লাভ/ক্ষতি শতাংশ:</span>
                        <span>${profitLossPercentage}%</span>
                    </div>
                </div>
            `;

            if (Object.keys(productAnalysis).length > 0) {
                statementHTML += `
                    <h4 style="color: #2a5298; margin-bottom: 15px; border-bottom: 1px solid #2a5298; padding-bottom: 5px;">পণ্য অনুযায়ী লাভ-ক্ষতি বিশ্লেষণ</h4>
                    <table class="excel-table">
                        <thead>
                            <tr>
                                <th>পণ্য আইডি</th>
                                <th>পণ্যের নাম</th>
                                <th>বিক্রয় পরিমাণ</th>
                                <th>মোট বিক্রয়</th>
                                <th>মোট লাভ/ক্ষতি</th>
                                <th>লাভ/ক্ষতি শতাংশ</th>
                            </tr>
                        </thead>
                        <tbody>
                `;
                
                Object.keys(productAnalysis).forEach(productId => {
                    const product = productAnalysis[productId];
                    const profitPercentage = totalPurchaseValue > 0 ? 
                        ((product.totalProfitLoss / totalPurchaseValue) * 100).toFixed(2) : 0;
                    const profitClass = product.totalProfitLoss > 0 ? 'profit-positive' : 
                                      product.totalProfitLoss < 0 ? 'profit-negative' : 'profit-neutral';
                    
                    statementHTML += `
                        <tr>
                            <td>${productId}</td>
                            <td>${product.name}</td>
                            <td>${product.totalQuantity}</td>
                            <td>${formatNumber(product.totalSales)} টাকা</td>
                            <td class="${profitClass}">${formatNumber(product.totalProfitLoss)} টাকা</td>
                            <td class="${profitClass}">${profitPercentage}%</td>
                        </tr>
                    `;
                });
                
                statementHTML += `
                        </tbody>
                    </table>
                `;
            }
            
            statementHTML += `
            </div>
            `;
            
            document.getElementById('statementResult').innerHTML = statementHTML;
            showStatementActions();
        });

        // তারিখ অনুযায়ী ফিল্টার ফাংশন
        function filterByDate(data, period, startDate, endDate, type = 'sale') {
            let filteredData = data;
            
            if (period === 'daily') {
                const today = new Date().toISOString().split('T')[0];
                filteredData = filteredData.filter(t => t.date === today);
            } else if (period === 'monthly') {
                const currentMonth = new Date().toISOString().substring(0, 7);
                filteredData = filteredData.filter(t => t.date.startsWith(currentMonth));
            } else if (period === 'yearly') {
                const currentYear = new Date().getFullYear();
                filteredData = filteredData.filter(t => t.date.startsWith(currentYear));
            } else if (period === 'custom' && startDate && endDate) {
                filteredData = filteredData.filter(t => t.date >= startDate && t.date <= endDate);
            }
            // 'all' এর জন্য কোন ফিল্টার প্রয়োগ করবে না
            
            return filteredData;
        }

        // স্টেটমেন্ট হেডার তৈরি
        function createStatementHeader(title) {
            return `
                <div class="print-section">
                    <div class="print-header">
                        <div class="logo">SA Traders</div>
                        <div class="tagline">বগুড়া - আপনার বিশ্বস্ত ব্যবসায়িক অংশীদার</div>
                        <div class="contact-info">
                            <div class="contact-item">
                                <i class="fas fa-map-marker-alt"></i>
                                <span>বগুড়া, বাংলাদেশ</span>
                            </div>
                            <div class="contact-item">
                                <i class="fas fa-phone"></i>
                                <span>০১৭১৩-৬৪৫৮৮৩</span>
                            </div>
                            <div class="contact-item">
                                <i class="fas fa-calendar-alt"></i>
                                <span>প্রিন্ট তারিখ: ${new Date().toLocaleDateString('bn-BD')}</span>
                            </div>
                        </div>
                    </div>
                    
                    <h3 style="text-align: center; color: #2a5298; margin-bottom: 20px; border-bottom: 2px solid #2a5298; padding-bottom: 10px;">${title}</h3>
            `;
        }

        // সময়কাল টেক্সট তৈরি
        function getPeriodText(period, startDate, endDate) {
            switch(period) {
                case 'daily':
                    return 'দৈনিক - ' + new Date().toLocaleDateString('bn-BD');
                case 'monthly':
                    return 'মাসিক - ' + new Date().toLocaleDateString('bn-BD', { month: 'long', year: 'numeric' });
                case 'yearly':
                    return 'বার্ষিক - ' + new Date().getFullYear();
                case 'custom':
                    return 'নির্দিষ্ট তারিখ - ' + startDate + ' থেকে ' + endDate;
                default:
                    return 'সমস্ত সময়';
            }
        }

        // স্টক রিপোর্ট প্রিন্ট
        document.getElementById('printStockBtn').addEventListener('click', function() {
            const data = dataManager.loadData();
            const products = data.products;
            
            let stockHTML = `
                <div class="print-section">
                    <div class="print-header">
                        <div class="logo">SA Traders</div>
                        <div class="tagline">বগুড়া - আপনার বিশ্বস্ত ব্যবসায়িক অংশীদার</div>
                        <div class="contact-info">
                            <div class="contact-item">
                                <i class="fas fa-map-marker-alt"></i>
                                <span>বগুড়া, বাংলাদেশ</span>
                            </div>
                            <div class="contact-item">
                                <i class="fas fa-phone"></i>
                                <span>০১৭১৩-৬৪৫৮৮৩</span>
                            </div>
                            <div class="contact-item">
                                <i class="fas fa-calendar-alt"></i>
                                <span>প্রিন্ট তারিখ: ${new Date().toLocaleDateString('bn-BD')}</span>
                            </div>
                        </div>
                    </div>
                    
                    <h3 style="text-align: center; color: #2a5298; margin-bottom: 20px; border-bottom: 2px solid #2a5298; padding-bottom: 10px;">পণ্য স্টক রিপোর্ট</h3>
                    
                    <table class="excel-table">
                        <thead>
                            <tr>
                                <th>পণ্য আইডি</th>
                                <th>পণ্যের নাম</th>
                                <th>ক্রয় মূল্য</th>
                                <th>বিক্রয় মূল্য</th>
                                <th>বর্তমান স্টক</th>
                                <th>স্টক স্ট্যাটাস</th>
                                <th>মোট ক্রয়</th>
                                <th>মোট বিক্রয়</th>
                                <th>স্টক মূল্য</th>
                                <th>ক্যাটাগরি</th>
                            </tr>
                        </thead>
                        <tbody>
            `;
            
            let totalProducts = 0;
            let totalStockQuantity = 0;
            let totalStockValue = 0;
            let lowStockProducts = 0;
            
            products.forEach(product => {
                const stockValue = product.stock * product.purchasePrice;
                const stockStatus = getStockStatus(product.stock);
                
                totalProducts++;
                totalStockQuantity += product.stock;
                totalStockValue += stockValue;
                
                if (product.stock <= 10) {
                    lowStockProducts++;
                }
                
                stockHTML += `
                    <tr>
                        <td>${product.id}</td>
                        <td>${product.name}</td>
                        <td>${formatNumber(product.purchasePrice)} টাকা</td>
                        <td>${formatNumber(product.sellingPrice || (product.purchasePrice * 1.2))} টাকা</td>
                        <td>${product.stock}</td>
                        <td>${stockStatus.text}</td>
                        <td>${product.totalPurchased || 0}</td>
                        <td>${product.totalSold || 0}</td>
                        <td>${formatNumber(stockValue)} টাকা</td>
                        <td>${product.category || '-'}</td>
                    </tr>
                `;
            });
            
            stockHTML += `
                        </tbody>
                    </table>
                    
                    <div class="summary-box" style="border: 2px solid #2a5298; background: linear-gradient(135deg, #f8f9fa, #e8f4f8); margin-top: 20px;">
                        <h4 style="text-align: center; margin-bottom: 15px; color: #2a5298; border-bottom: 1px solid #2a5298; padding-bottom: 5px;">স্টক সারাংশ</h4>
                        <div class="summary-item">
                            <span>মোট পণ্য:</span>
                            <span>${totalProducts} টি</span>
                        </div>
                        <div class="summary-item">
                            <span>মোট স্টক পরিমাণ:</span>
                            <span>${totalStockQuantity}</span>
                        </div>
                        <div class="summary-item">
                            <span>মোট স্টক মূল্য:</span>
                            <span>${formatNumber(totalStockValue)} টাকা</span>
                        </div>
                        <div class="summary-item">
                            <span>নিম্ন স্টক পণ্য:</span>
                            <span>${lowStockProducts} টি</span>
                        </div>
                    </div>
                </div>
            `;
            
            const printWindow = window.open('', '_blank');
            printWindow.document.write(`
                <!DOCTYPE html>
                <html>
                <head>
                    <title>স্টক রিপোর্ট - SA Traders</title>
                    <style>
                        body { font-family: Arial, sans-serif; margin: 20px; }
                        .excel-table { border-collapse: collapse; width: 100%; font-size: 12px; }
                        .excel-table th, .excel-table td { border: 1px solid #000; padding: 6px 8px; text-align: left; }
                        .excel-table th { background-color: #f2f2f2; font-weight: bold; }
                        .summary-box { border: 1px solid #000; padding: 10px; margin-top: 15px; background-color: #f9f9f9; }
                        .print-header { background: #1e3c72; color: white; padding: 20px; text-align: center; margin-bottom: 20px; }
                    </style>
                </head>
                <body>
                    ${stockHTML}
                </body>
                </html>
            `);
            printWindow.document.close();
            printWindow.print();
        });

        // স্টক ডাউনলোড
        document.getElementById('downloadStockBtn').addEventListener('click', function() {
            const data = dataManager.loadData();
            const products = data.products;
            
            let csvContent = "পণ্য আইডি,পণ্যের নাম,ক্রয় মূল্য,বিক্রয় মূল্য,বর্তমান স্টক,স্টক স্ট্যাটাস,মোট ক্রয়,মোট বিক্রয়,স্টক মূল্য,ক্যাটাগরি\n";
            
            products.forEach(product => {
                const stockValue = product.stock * product.purchasePrice;
                const stockStatus = getStockStatus(product.stock);
                
                csvContent += `"${product.id}","${product.name}",${product.purchasePrice},${product.sellingPrice || (product.purchasePrice * 1.2)},${product.stock},"${stockStatus.text}",${product.totalPurchased || 0},${product.totalSold || 0},${stockValue},"${product.category || '-'}"\n`;
            });
            
            const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `SA_Traders_Stock_${new Date().toISOString().split('T')[0]}.csv`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(url);
            
            alert('স্টক রিপোর্ট CSV ফরম্যাটে ডাউনলোড করা হয়েছে!');
        });

        // স্টেটমেন্ট প্রিন্ট
        document.getElementById('printStatementBtn').addEventListener('click', function() {
            window.print();
        });

        // PDF ডাউনলোড
        document.getElementById('downloadPDFBtn').addEventListener('click', function() {
            alert('PDF ডাউনলোড ফিচারটি সক্রিয় করতে jsPDF লাইব্রেরি যোগ করুন');
        });

        // এক্সেল ডাউনলোড
        document.getElementById('downloadExcelBtn').addEventListener('click', function() {
            alert('এক্সেল ডাউনলোড ফিচারটি সক্রিয় করতে SheetJS লাইব্রেরি যোগ করুন');
        });

        // স্টেটমেন্ট তৈরি হলে প্রিন্ট বাটন দেখানো
        function showStatementActions() {
            document.getElementById('statementActions').style.display = 'flex';
        }

        // ============================================
        // ডেটা ম্যানেজমেন্ট ফাংশনালিটি
        // ============================================
        document.getElementById('saveDataBtn').addEventListener('click', function() {
            if (dataManager.exportData()) {
                alert('সমস্ত ডেটা সফলভাবে সেভ করা হয়েছে!');
            } else {
                alert('ডেটা সেভ করতে সমস্যা হয়েছে!');
            }
        });

        document.getElementById('loadDataBtn').addEventListener('click', function() {
            document.getElementById('fileInput').click();
        });

        document.getElementById('backupDataBtn').addEventListener('click', function() {
            if (dataManager.createBackup()) {
                alert('অটো ব্যাকআপ তৈরি করা হয়েছে!');
                updateDataStatus();
            } else {
                alert('ব্যাকআপ তৈরি করতে সমস্যা হয়েছে!');
            }
        });

        document.getElementById('restoreBackupBtn').addEventListener('click', function() {
            document.getElementById('backupFileInput').click();
        });

        document.getElementById('clearDataBtn').addEventListener('click', function() {
            if (confirm('আপনি কি সমস্ত ডেটা ক্লিয়ার করতে চান? এই কাজটি বিপরীতযোগ্য নয়!')) {
                if (dataManager.clearAllData()) {
                    alert('সমস্ত ডেটা ক্লিয়ার করা হয়েছে!');
                    initializeDashboard();
                } else {
                    alert('ডেটা ক্লিয়ার করতে সমস্যা হয়েছে!');
                }
            }
        });

        // ডেটা ইম্পোর্ট
        document.getElementById('fileInput').addEventListener('change', function(event) {
            const file = event.target.files[0];
            if (file) {
                if (confirm('আপনি কি নিশ্চিত যে আপনি এই ডেটা লোড করতে চান? বর্তমান ডেটা ওভাররাইট হয়ে যাবে!')) {
                    dataManager.importData(file)
                        .then(success => {
                            if (success) {
                                alert('ডেটা সফলভাবে লোড করা হয়েছে!');
                                initializeDashboard();
                            }
                        })
                        .catch(error => {
                            alert('ডেটা লোড করতে সমস্যা হয়েছে: ' + error.message);
                        });
                }
            }
            this.value = '';
        });

        // ব্যাকআপ থেকে রিস্টোর
        document.getElementById('backupFileInput').addEventListener('change', function(event) {
            const file = event.target.files[0];
            if (file) {
                if (confirm('আপনি কি ব্যাকআপ থেকে ডেটা রিস্টোর করতে চান? বর্তমান ডেটা হারিয়ে যাবে!')) {
                    const reader = new FileReader();
                    reader.onload = function(e) {
                        try {
                            const importedData = JSON.parse(e.target.result);
                            localStorage.setItem('saTradersBackup_v2', JSON.stringify(importedData));
                            if (dataManager.restoreFromBackup()) {
                                alert('ব্যাকআপ থেকে ডেটা সফলভাবে রিস্টোর করা হয়েছে!');
                                initializeDashboard();
                            }
                        } catch (error) {
                            alert('ব্যাকআপ থেকে রিস্টোর করতে সমস্যা হয়েছে: ' + error.message);
                        }
                    };
                    reader.readAsText(file);
                }
            }
            this.value = '';
        });

        // ডেটা স্ট্যাটাস আপডেট
        function updateDataStatus() {
            const data = dataManager.loadData();
            const customers = data.customers;
            const products = data.products;
            const transactions = data.transactions;
            const purchases = data.purchases;
            const backupExists = localStorage.getItem('saTradersBackup_v2') !== null;
            
            let statusHTML = `
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-bottom: 10px;">
                    <div style="padding: 8px; background: white; border-radius: 5px;">
                        <strong>ক্রেতা:</strong> ${customers.length} জন
                    </div>
                    <div style="padding: 8px; background: white; border-radius: 5px;">
                        <strong>পণ্য:</strong> ${products.length} টি
                    </div>
                    <div style="padding: 8px; background: white; border-radius: 5px;">
                        <strong>বিক্রয়:</strong> ${transactions.length} টি
                    </div>
                    <div style="padding: 8px; background: white; border-radius: 5px;">
                        <strong>ক্রয়:</strong> ${purchases.length} টি
                    </div>
                </div>
                <div style="padding: 10px; background: ${backupExists ? '#d4edda' : '#fff3cd'}; border-radius: 5px; border: 1px solid ${backupExists ? '#c3e6cb' : '#ffeaa7'};">
                    <strong>ব্যাকআপ স্ট্যাটাস:</strong> ${backupExists ? 'ব্যাকআপ উপলব্ধ' : 'কোনো ব্যাকআপ নেই'}
                </div>
                <div style="margin-top: 10px; padding: 10px; background: #e8f4f8; border-radius: 5px; border: 1px solid #b8daff;">
                    <strong>সর্বশেষ আপডেট:</strong> ${new Date(data.lastUpdated).toLocaleString('bn-BD')}
                </div>
            `;
            
            document.getElementById('dataStatus').innerHTML = statusHTML;
        }

        // অটোসেভ ফিচার - প্রতি ২ মিনিটে অটো ব্যাকআপ
        setInterval(function() {
            dataManager.createBackup();
            console.log('অটো ব্যাকআপ তৈরি করা হয়েছে');
        }, 2 * 60 * 1000);

        // ============================================
        // ড্যাশবোর্ড ইনিশিয়ালাইজেশন
        // ============================================
        function initializeDashboard() {
            loadProducts();
            loadCustomers();
            loadTransactions();
            loadPurchases();
            updateProductDropdown();
            loadCommissionRate();
            updateProfitLossSummary();
            updateDataStatus();
            
            // তারিখ সেট করা
            setCurrentDate();
            
            // এডিটিং ডেটা চেক
            checkEditingData();
        }

        // এডিটিং ডেটা চেক এবং ফর্ম পূরণ
        function checkEditingData() {
            const editingProduct = dataManager.getEditingData('product');
            if (editingProduct) {
                editProductFromData(editingProduct);
            }
            
            const editingCustomer = dataManager.getEditingData('customer');
            if (editingCustomer) {
                editCustomerFromData(editingCustomer);
            }
            
            const editingTransaction = dataManager.getEditingData('transaction');
            if (editingTransaction) {
                editTransactionFromData(editingTransaction);
            }
            
            const editingPurchase = dataManager.getEditingData('purchase');
            if (editingPurchase) {
                editPurchaseFromData(editingPurchase);
            }
        }

        function editProductFromData(product) {
            const data = dataManager.loadData();
            const productIndex = data.products.findIndex(p => p.id === product.id);
            if (productIndex !== -1) {
                editProduct(productIndex);
            } else {
                dataManager.clearEditingData('product');
            }
        }

        function editCustomerFromData(customer) {
            const data = dataManager.loadData();
            const customerIndex = data.customers.findIndex(c => c.id === customer.id);
            if (customerIndex !== -1) {
                editCustomer(customerIndex);
            } else {
                dataManager.clearEditingData('customer');
            }
        }

        function editTransactionFromData(transaction) {
            const data = dataManager.loadData();
            const transactionIndex = data.transactions.findIndex(t => 
                t.customerId === transaction.customerId && 
                t.productId === transaction.productId &&
                t.date === transaction.date
            );
            if (transactionIndex !== -1) {
                editTransaction(transactionIndex);
            } else {
                dataManager.clearEditingData('transaction');
            }
        }

        function editPurchaseFromData(purchase) {
            const data = dataManager.loadData();
            const purchaseIndex = data.purchases.findIndex(p => 
                p.productId === purchase.productId && 
                p.date === purchase.date &&
                p.supplier === purchase.supplier
            );
            if (purchaseIndex !== -1) {
                editPurchase(purchaseIndex);
            } else {
                dataManager.clearEditingData('purchase');
            }
        }

        // প্রথম লোডে ডেটা স্ট্যাটাস আপডেট
        window.addEventListener('load', function() {
            setTimeout(updateDataStatus, 1000);
        });
        // ============================================
// পেমেন্ট ব্যবস্থাপনা সিস্টেম
// ============================================

// পেমেন্ট ব্যবস্থাপনা কার্ড যোগ করুন
function addPaymentManagementSection() {
    const dashboard = document.getElementById('dashboard');
    
    // পেমেন্ট সেকশন তৈরি করুন (ক্রয়ের তালিকার পরে)
    const purchasesCard = document.querySelector('.card:nth-last-child(3)');
    
    const paymentSectionHTML = `
        <div class="card">
            <h3>পেমেন্ট ব্যবস্থাপনা</h3>
            
            <div class="action-buttons" style="margin-bottom: 20px;">
                <button class="btn btn-success" id="supplierPaymentBtn">সাপ্লায়ার পেমেন্ট</button>
                <button class="btn btn-info" id="customerPaymentBtn">ক্রেতা পেমেন্ট</button>
                <button class="btn btn-warning" id="viewPaymentHistoryBtn">পেমেন্ট হিস্ট্রি</button>
                <button class="btn btn-secondary" id="viewDueSummaryBtn">বাকি টাকা সারাংশ</button>
            </div>
            
            <!-- সাপ্লায়ার পেমেন্ট ফর্ম -->
            <div id="supplierPaymentForm" class="payment-form" style="display: none;">
                <h4 style="color: #28a745; margin-bottom: 15px;">সাপ্লায়ার পেমেন্ট</h4>
                <form id="addSupplierPaymentForm">
                    <div class="form-group">
                        <label for="supplierPaymentSupplier">সাপ্লায়ার নাম</label>
                        <input type="text" id="supplierPaymentSupplier" placeholder="সাপ্লায়ার নাম" required>
                        <div class="error-message" id="supplierError">সাপ্লায়ার পাওয়া যায়নি!</div>
                    </div>
                    <div class="form-group">
                        <label for="supplierPaymentAmount">পেমেন্ট পরিমাণ</label>
                        <input type="number" id="supplierPaymentAmount" placeholder="পেমেন্ট পরিমাণ" required>
                    </div>
                    <div class="form-group">
                        <label for="supplierPaymentMode">পেমেন্ট মোড</label>
                        <select id="supplierPaymentMode" required>
                            <option value="">পেমেন্ট মোড নির্বাচন করুন</option>
                            <option value="cash">নগদ</option>
                            <option value="bank">ব্যাংক</option>
                            <option value="bkash">বিকাশ</option>
                            <option value="nagad">নগদ</option>
                            <option value="check">চেক</option>
                        </select>
                    </div>
                    <div class="form-group" id="bankDetailsSection" style="display: none;">
                        <label for="bankDetails">ব্যাংক বিবরণ</label>
                        <input type="text" id="bankDetails" placeholder="ব্যাংক নাম, শাখা, একাউন্ট নম্বর">
                    </div>
                    <div class="form-group" id="mobileBankingDetailsSection" style="display: none;">
                        <label for="mobileBankingDetails">মোবাইল নম্বর/ট্র্যানজেকশন আইডি</label>
                        <input type="text" id="mobileBankingDetails" placeholder="মোবাইল নম্বর বা ট্র্যানজেকশন আইডি">
                    </div>
                    <div class="form-group">
                        <label for="supplierPaymentDate">পেমেন্ট তারিখ</label>
                        <input type="date" id="supplierPaymentDate" required>
                    </div>
                    <div class="form-group">
                        <label for="supplierPaymentNotes">মন্তব্য</label>
                        <textarea id="supplierPaymentNotes" placeholder="যেকোনো মন্তব্য" rows="2"></textarea>
                    </div>
                    <div class="form-group">
                        <div class="amount-display" id="supplierDueAmount">
                            মোট বাকি টাকা: লোড হচ্ছে...
                        </div>
                    </div>
                    <div class="action-buttons">
                        <button type="submit" class="btn btn-success">সাপ্লায়ার পেমেন্ট করুন</button>
                        <button type="button" class="btn btn-secondary" id="cancelSupplierPaymentBtn">বাতিল করুন</button>
                    </div>
                </form>
            </div>
            
            <!-- ক্রেতা পেমেন্ট ফর্ম -->
            <div id="customerPaymentForm" class="payment-form" style="display: none;">
                <h4 style="color: #17a2b8; margin-bottom: 15px;">ক্রেতা পেমেন্ট</h4>
                <form id="addCustomerPaymentForm">
                    <div class="form-group">
                        <label for="customerPaymentCustomerId">ক্রেতা আইডি</label>
                        <input type="text" id="customerPaymentCustomerId" placeholder="ক্রেতা আইডি" required>
                        <div class="error-message" id="customerPaymentError">ক্রেতা আইডি পাওয়া যায়নি!</div>
                    </div>
                    <div class="form-group">
                        <label for="customerPaymentAmount">পেমেন্ট পরিমাণ</label>
                        <input type="number" id="customerPaymentAmount" placeholder="পেমেন্ট পরিমাণ" required>
                    </div>
                    <div class="form-group">
                        <label for="customerPaymentMode">পেমেন্ট মোড</label>
                        <select id="customerPaymentMode" required>
                            <option value="">পেমেন্ট মোড নির্বাচন করুন</option>
                            <option value="cash">নগদ</option>
                            <option value="bank">ব্যাংক</option>
                            <option value="bkash">বিকাশ</option>
                            <option value="nagad">নগদ</option>
                            <option value="check">চেক</option>
                        </select>
                    </div>
                    <div class="form-group" id="customerBankDetailsSection" style="display: none;">
                        <label for="customerBankDetails">ব্যাংক বিবরণ</label>
                        <input type="text" id="customerBankDetails" placeholder="ব্যাংক নাম, শাখা, একাউন্ট নম্বর">
                    </div>
                    <div class="form-group" id="customerMobileBankingDetailsSection" style="display: none;">
                        <label for="customerMobileBankingDetails">মোবাইল নম্বর/ট্র্যানজেকশন আইডি</label>
                        <input type="text" id="customerMobileBankingDetails" placeholder="মোবাইল নম্বর বা ট্র্যানজেকশন আইডি">
                    </div>
                    <div class="form-group">
                        <label for="customerPaymentDate">পেমেন্ট তারিখ</label>
                        <input type="date" id="customerPaymentDate" required>
                    </div>
                    <div class="form-group">
                        <label for="customerPaymentNotes">মন্তব্য</label>
                        <textarea id="customerPaymentNotes" placeholder="যেকোনো মন্তব্য" rows="2"></textarea>
                    </div>
                    <div class="form-group">
                        <div class="amount-display" id="customerDueAmount">
                            মোট বাকি টাকা: লোড হচ্ছে...
                        </div>
                    </div>
                    <div class="action-buttons">
                        <button type="submit" class="btn btn-info">ক্রেতা পেমেন্ট গ্রহণ করুন</button>
                        <button type="button" class="btn btn-secondary" id="cancelCustomerPaymentBtn">বাতিল করুন</button>
                    </div>
                </form>
            </div>
            
            <!-- পেমেন্ট হিস্ট্রি -->
            <div id="paymentHistorySection" style="display: none;">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px;">
                    <h4 style="color: #ffc107;">পেমেন্ট হিস্ট্রি</h4>
                    <div class="print-actions no-print">
                        <button class="print-btn" id="printPaymentHistoryBtn">
                            <i class="fas fa-print"></i> পেমেন্ট হিস্ট্রি প্রিন্ট
                        </button>
                    </div>
                </div>
                
                <div class="statement-options" style="margin-bottom: 15px;">
                    <div class="form-group">
                        <label for="paymentHistoryType">পেমেন্ট ধরন</label>
                        <select id="paymentHistoryType">
                            <option value="all">সকল পেমেন্ট</option>
                            <option value="supplier">সাপ্লায়ার পেমেন্ট</option>
                            <option value="customer">ক্রেতা পেমেন্ট</option>
                        </select>
                    </div>
                    <div class="form-group">
                        <label for="paymentHistoryPeriod">সময়কাল</label>
                        <select id="paymentHistoryPeriod">
                            <option value="all">সমস্ত সময়</option>
                            <option value="daily">দৈনিক</option>
                            <option value="monthly">মাসিক</option>
                            <option value="custom">নির্দিষ্ট তারিখ</option>
                        </select>
                    </div>
                    <div class="form-group" id="paymentCustomDateRange" style="display: none;">
                        <label for="paymentStartDate">শুরুর তারিখ</label>
                        <input type="date" id="paymentStartDate">
                        <label for="paymentEndDate">শেষ তারিখ</label>
                        <input type="date" id="paymentEndDate">
                    </div>
                    <div class="form-group">
                        <button class="btn btn-success" id="filterPaymentHistoryBtn">ফিল্টার প্রয়োগ করুন</button>
                    </div>
                </div>
                
                <div id="paymentHistoryList">
                    <!-- পেমেন্ট হিস্ট্রি এখানে দেখাবে -->
                </div>
                
                <div class="action-buttons" style="margin-top: 15px;">
                    <button class="btn btn-secondary" id="closePaymentHistoryBtn">বন্ধ করুন</button>
                </div>
            </div>
            
            <!-- বাকি টাকা সারাংশ -->
            <div id="dueSummarySection" style="display: none;">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px;">
                    <h4 style="color: #dc3545;">বাকি টাকা সারাংশ</h4>
                    <div class="print-actions no-print">
                        <button class="print-btn" id="printDueSummaryBtn">
                            <i class="fas fa-print"></i> সারাংশ প্রিন্ট
                        </button>
                    </div>
                </div>
                
                <div id="dueSummaryContent">
                    <!-- বাকি টাকা সারাংশ এখানে দেখাবে -->
                </div>
                
                <div class="action-buttons" style="margin-top: 15px;">
                    <button class="btn btn-secondary" id="closeDueSummaryBtn">বন্ধ করুন</button>
                </div>
            </div>
        </div>
    `;
    
    // পেমেন্ট সেকশন যোগ করুন
    if (purchasesCard) {
        purchasesCard.insertAdjacentHTML('afterend', paymentSectionHTML);
    } else {
        // বিকল্পভাবে ড্যাশবোর্ডের শেষে যোগ করুন
        dashboard.insertAdjacentHTML('beforeend', paymentSectionHTML);
    }
    
    // সিএসএস স্টাইল যোগ করুন
    addPaymentStyles();
    
    // ইভেন্ট লিসেনার সেট আপ করুন
    setupPaymentEventListeners();
    
    // তারিখ সেট করুন
    setPaymentDates();
}

// পেমেন্ট স্টাইল যোগ করুন
function addPaymentStyles() {
    const style = document.createElement('style');
    style.textContent = `
        .payment-form {
            background: #f8f9fa;
            padding: 20px;
            border-radius: 8px;
            margin-bottom: 20px;
            border: 1px solid #dee2e6;
        }
        
        .payment-form .form-group {
            margin-bottom: 15px;
        }
        
        .payment-form textarea {
            width: 100%;
            padding: 10px;
            border: 1px solid #ddd;
            border-radius: 5px;
            resize: vertical;
        }
        
        .payment-record {
            background: white;
            padding: 15px;
            margin-bottom: 10px;
            border-radius: 5px;
            border: 1px solid #e9ecef;
            box-shadow: 0 2px 4px rgba(0,0,0,0.05);
        }
        
        .payment-record.supplier {
            border-left: 4px solid #28a745;
        }
        
        .payment-record.customer {
            border-left: 4px solid #17a2b8;
        }
        
        .payment-method {
            display: inline-block;
            padding: 3px 8px;
            border-radius: 12px;
            font-size: 12px;
            font-weight: bold;
            margin-right: 5px;
        }
        
        .payment-cash {
            background: #28a745;
            color: white;
        }
        
        .payment-bank {
            background: #007bff;
            color: white;
        }
        
        .payment-bkash {
            background: #e2136e;
            color: white;
        }
        
        .payment-nagad {
            background: #eb0029;
            color: white;
        }
        
        .payment-check {
            background: #6f42c1;
            color: white;
        }
        
        .due-summary-card {
            background: white;
            padding: 20px;
            margin-bottom: 15px;
            border-radius: 8px;
            border: 1px solid #dee2e6;
            box-shadow: 0 3px 6px rgba(0,0,0,0.08);
        }
        
        .due-summary-card.supplier {
            border-top: 4px solid #28a745;
        }
        
        .due-summary-card.customer {
            border-top: 4px solid #17a2b8;
        }
        
        .due-amount {
            font-size: 24px;
            font-weight: bold;
            margin: 10px 0;
            color: #dc3545;
        }
        
        .due-positive {
            color: #28a745;
        }
        
        .supplier-list, .customer-list {
            max-height: 300px;
            overflow-y: auto;
            margin-top: 10px;
        }
        
        .supplier-item, .customer-item {
            padding: 10px;
            border-bottom: 1px solid #eee;
            cursor: pointer;
            transition: background 0.2s;
        }
        
        .supplier-item:hover, .customer-item:hover {
            background: #f8f9fa;
        }
        
        .supplier-item.selected, .customer-item.selected {
            background: #e8f4ff;
            border-left: 3px solid #007bff;
        }
        
        .supplier-name {
            font-weight: bold;
            color: #333;
        }
        
        .supplier-due {
            float: right;
            color: #dc3545;
            font-weight: bold;
        }
        
        .customer-name {
            font-weight: bold;
            color: #333;
        }
        
        .customer-due {
            float: right;
            color: #dc3545;
            font-weight: bold;
        }
        
        .payment-details {
            font-size: 12px;
            color: #666;
            margin-top: 5px;
        }
    `;
    document.head.appendChild(style);
}

// ইভেন্ট লিসেনার সেট আপ করুন
function setupPaymentEventListeners() {
    // বাটন ক্লিক ইভেন্ট
    document.getElementById('supplierPaymentBtn')?.addEventListener('click', showSupplierPaymentForm);
    document.getElementById('customerPaymentBtn')?.addEventListener('click', showCustomerPaymentForm);
    document.getElementById('viewPaymentHistoryBtn')?.addEventListener('click', showPaymentHistory);
    document.getElementById('viewDueSummaryBtn')?.addEventListener('click', showDueSummary);
    
    // ফর্ম বাতিল বাটন
    document.getElementById('cancelSupplierPaymentBtn')?.addEventListener('click', hideAllPaymentSections);
    document.getElementById('cancelCustomerPaymentBtn')?.addEventListener('click', hideAllPaymentSections);
    
    // ফর্ম সাবমিট
    document.getElementById('addSupplierPaymentForm')?.addEventListener('submit', processSupplierPayment);
    document.getElementById('addCustomerPaymentForm')?.addEventListener('submit', processCustomerPayment);
    
    // পেমেন্ট মোড পরিবর্তন
    document.getElementById('supplierPaymentMode')?.addEventListener('change', togglePaymentDetails);
    document.getElementById('customerPaymentMode')?.addEventListener('change', toggleCustomerPaymentDetails);
    
    // সাপ্লায়ার নাম ইনপুট পরিবর্তন
    document.getElementById('supplierPaymentSupplier')?.addEventListener('input', updateSupplierDueAmount);
    
    // ক্রেতা আইডি ইনপুট পরিবর্তন
    document.getElementById('customerPaymentCustomerId')?.addEventListener('input', updateCustomerDueAmount);
    
    // পেমেন্ট হিস্ট্রি ফিল্টার
    document.getElementById('paymentHistoryPeriod')?.addEventListener('change', togglePaymentDateRange);
    document.getElementById('filterPaymentHistoryBtn')?.addEventListener('click', loadPaymentHistory);
    
    // বন্ধ করুন বাটন
    document.getElementById('closePaymentHistoryBtn')?.addEventListener('click', hideAllPaymentSections);
    document.getElementById('closeDueSummaryBtn')?.addEventListener('click', hideAllPaymentSections);
    
    // প্রিন্ট বাটন
    document.getElementById('printPaymentHistoryBtn')?.addEventListener('click', printPaymentHistory);
    document.getElementById('printDueSummaryBtn')?.addEventListener('click', printDueSummary);
}

// তারিখ সেট করুন
function setPaymentDates() {
    const today = new Date().toISOString().split('T')[0];
    
    const supplierDate = document.getElementById('supplierPaymentDate');
    const customerDate = document.getElementById('customerPaymentDate');
    const paymentStartDate = document.getElementById('paymentStartDate');
    const paymentEndDate = document.getElementById('paymentEndDate');
    
    if (supplierDate) supplierDate.value = today;
    if (customerDate) customerDate.value = today;
    if (paymentStartDate) paymentStartDate.value = today;
    if (paymentEndDate) paymentEndDate.value = today;
}

// সাপ্লায়ার পেমেন্ট ফর্ম দেখান
function showSupplierPaymentForm() {
    hideAllPaymentSections();
    document.getElementById('supplierPaymentForm').style.display = 'block';
    
    // সাপ্লায়ার তালিকা লোড করুন
    loadSupplierList();
    
    // সাপ্লায়ার অটোকমপ্লিট সেট আপ করুন
    setupSupplierAutocomplete();
}

// ক্রেতা পেমেন্ট ফর্ম দেখান
function showCustomerPaymentForm() {
    hideAllPaymentSections();
    document.getElementById('customerPaymentForm').style.display = 'block';
    
    // ক্রেতা অটোকমপ্লিট সেট আপ করুন
    setupCustomerAutocomplete();
}

// পেমেন্ট হিস্ট্রি দেখান
function showPaymentHistory() {
    hideAllPaymentSections();
    document.getElementById('paymentHistorySection').style.display = 'block';
    
    // পেমেন্ট হিস্ট্রি লোড করুন
    loadPaymentHistory();
}

// বাকি টাকা সারাংশ দেখান
function showDueSummary() {
    hideAllPaymentSections();
    document.getElementById('dueSummarySection').style.display = 'block';
    
    // বাকি টাকা সারাংশ লোড করুন
    loadDueSummary();
}

// সব পেমেন্ট সেকশন লুকান
function hideAllPaymentSections() {
    document.getElementById('supplierPaymentForm').style.display = 'none';
    document.getElementById('customerPaymentForm').style.display = 'none';
    document.getElementById('paymentHistorySection').style.display = 'none';
    document.getElementById('dueSummarySection').style.display = 'none';
}

// পেমেন্ট মোড অনুযায়ী অতিরিক্ত ফিল্ড দেখান/লুকান
function togglePaymentDetails() {
    const mode = document.getElementById('supplierPaymentMode').value;
    const bankSection = document.getElementById('bankDetailsSection');
    const mobileSection = document.getElementById('mobileBankingDetailsSection');
    
    if (bankSection) bankSection.style.display = mode === 'bank' ? 'block' : 'none';
    if (mobileSection) mobileSection.style.display = (mode === 'bkash' || mode === 'nagad') ? 'block' : 'none';
}

function toggleCustomerPaymentDetails() {
    const mode = document.getElementById('customerPaymentMode').value;
    const bankSection = document.getElementById('customerBankDetailsSection');
    const mobileSection = document.getElementById('customerMobileBankingDetailsSection');
    
    if (bankSection) bankSection.style.display = mode === 'bank' ? 'block' : 'none';
    if (mobileSection) mobileSection.style.display = (mode === 'bkash' || mode === 'nagad') ? 'block' : 'none';
}

// পেমেন্ট তারিখ রেঞ্জ টগল
function togglePaymentDateRange() {
    const period = document.getElementById('paymentHistoryPeriod').value;
    const dateRange = document.getElementById('paymentCustomDateRange');
    
    if (dateRange) {
        dateRange.style.display = period === 'custom' ? 'block' : 'none';
    }
}

// সাপ্লায়ার অটোকমপ্লিট সেট আপ
function setupSupplierAutocomplete() {
    const input = document.getElementById('supplierPaymentSupplier');
    const data = dataManager.loadData();
    const purchases = data.purchases;
    
    // ইউনিক সাপ্লায়ার তালিকা তৈরি করুন
    const suppliers = [...new Set(purchases.map(p => p.supplier).filter(s => s))];
    
    // অটোকমপ্লিট ফাংশনালিটি
    input.addEventListener('input', function() {
        const value = this.value.toLowerCase();
        const suggestions = suppliers.filter(s => 
            s.toLowerCase().includes(value)
        );
        
        // ড্রপডাউন দেখান (সরল ইম্প্লিমেন্টেশন)
        if (value.length > 1 && suggestions.length > 0) {
            showSupplierSuggestions(suggestions);
        }
    });
}

// সাপ্লায়ার সাজেশন দেখান
function showSupplierSuggestions(suppliers) {
    const input = document.getElementById('supplierPaymentSupplier');
    const container = input.parentElement;
    
    // বিদ্যমান সাজেশন সরান
    const existingList = container.querySelector('.supplier-suggestions');
    if (existingList) existingList.remove();
    
    // নতুন সাজেশন লিস্ট তৈরি করুন
    const list = document.createElement('div');
    list.className = 'supplier-suggestions';
    list.style.cssText = `
        position: absolute;
        background: white;
        border: 1px solid #ddd;
        max-height: 200px;
        overflow-y: auto;
        width: calc(100% - 2px);
        z-index: 1000;
        box-shadow: 0 4px 8px rgba(0,0,0,0.1);
        border-radius: 0 0 5px 5px;
    `;
    
    suppliers.forEach(supplier => {
        const item = document.createElement('div');
        item.textContent = supplier;
        item.style.cssText = `
            padding: 8px 12px;
            cursor: pointer;
            border-bottom: 1px solid #eee;
        `;
        item.addEventListener('click', function() {
            input.value = supplier;
            list.remove();
            updateSupplierDueAmount();
        });
        item.addEventListener('mouseover', function() {
            this.style.background = '#f8f9fa';
        });
        item.addEventListener('mouseout', function() {
            this.style.background = 'white';
        });
        list.appendChild(item);
    });
    
    container.style.position = 'relative';
    container.appendChild(list);
}

// ক্রেতা অটোকমপ্লিট সেট আপ
function setupCustomerAutocomplete() {
    const input = document.getElementById('customerPaymentCustomerId');
    const data = dataManager.loadData();
    const customers = data.customers;
    
    // অটোকমপ্লিট ফাংশনালিটি
    input.addEventListener('input', function() {
        const value = this.value.toLowerCase();
        const suggestions = customers.filter(c => 
            c.id.toLowerCase().includes(value) || 
            c.name.toLowerCase().includes(value)
        );
        
        // ড্রপডাউন দেখান
        if (value.length > 1 && suggestions.length > 0) {
            showCustomerSuggestions(suggestions);
        }
    });
}

// ক্রেতা সাজেশন দেখান
function showCustomerSuggestions(customers) {
    const input = document.getElementById('customerPaymentCustomerId');
    const container = input.parentElement;
    
    // বিদ্যমান সাজেশন সরান
    const existingList = container.querySelector('.customer-suggestions');
    if (existingList) existingList.remove();
    
    // নতুন সাজেশন লিস্ট তৈরি করুন
    const list = document.createElement('div');
    list.className = 'customer-suggestions';
    list.style.cssText = `
        position: absolute;
        background: white;
        border: 1px solid #ddd;
        max-height: 200px;
        overflow-y: auto;
        width: calc(100% - 2px);
        z-index: 1000;
        box-shadow: 0 4px 8px rgba(0,0,0,0.1);
        border-radius: 0 0 5px 5px;
    `;
    
    customers.forEach(customer => {
        const item = document.createElement('div');
        item.innerHTML = `<strong>${customer.id}</strong> - ${customer.name}`;
        item.style.cssText = `
            padding: 8px 12px;
            cursor: pointer;
            border-bottom: 1px solid #eee;
        `;
        item.addEventListener('click', function() {
            input.value = customer.id;
            list.remove();
            updateCustomerDueAmount();
        });
        item.addEventListener('mouseover', function() {
            this.style.background = '#f8f9fa';
        });
        item.addEventListener('mouseout', function() {
            this.style.background = 'white';
        });
        list.appendChild(item);
    });
    
    container.style.position = 'relative';
    container.appendChild(list);
}

// সাপ্লায়ার বাকি টাকা আপডেট
function updateSupplierDueAmount() {
    const supplierName = document.getElementById('supplierPaymentSupplier').value;
    const dueDisplay = document.getElementById('supplierDueAmount');
    
    if (!supplierName) {
        dueDisplay.innerHTML = 'মোট বাকি টাকা: সাপ্লায়ার নির্বাচন করুন';
        return;
    }
    
    const data = dataManager.loadData();
    const purchases = data.purchases;
    
    // এই সাপ্লায়ারের মোট বাকি টাকা হিসাব
    let totalDue = 0;
    purchases.forEach(purchase => {
        if (purchase.supplier === supplierName) {
            totalDue += (purchase.dueAmount || 0);
        }
    });
    
    dueDisplay.innerHTML = `মোট বাকি টাকা: <span style="color: ${totalDue > 0 ? '#dc3545' : '#28a745'}; font-weight: bold;">${formatNumber(totalDue)} টাকা</span>`;
}

// ক্রেতার বাকি টাকা আপডেট
function updateCustomerDueAmount() {
    const customerId = document.getElementById('customerPaymentCustomerId').value;
    const dueDisplay = document.getElementById('customerDueAmount');
    
    if (!customerId) {
        dueDisplay.innerHTML = 'মোট বাকি টাকা: ক্রেতা নির্বাচন করুন';
        return;
    }
    
    const data = dataManager.loadData();
    const transactions = data.transactions;
    
    // এই ক্রেতার মোট বাকি টাকা হিসাব
    let totalDue = 0;
    transactions.forEach(transaction => {
        if (transaction.customerId === customerId) {
            totalDue += (transaction.dueAmount || 0);
        }
    });
    
    dueDisplay.innerHTML = `মোট বাকি টাকা: <span style="color: ${totalDue > 0 ? '#dc3545' : '#28a745'}; font-weight: bold;">${formatNumber(totalDue)} টাকা</span>`;
}

// সাপ্লায়ার তালিকা লোড করুন
function loadSupplierList() {
    const data = dataManager.loadData();
    const purchases = data.purchases;
    
    // ইউনিক সাপ্লায়ার তালিকা তৈরি করুন
    const suppliers = {};
    purchases.forEach(purchase => {
        if (purchase.supplier) {
            if (!suppliers[purchase.supplier]) {
                suppliers[purchase.supplier] = 0;
            }
            suppliers[purchase.supplier] += (purchase.dueAmount || 0);
        }
    });
    
    // সাজেশন কন্টেইনার
    const container = document.getElementById('supplierPaymentSupplier').parentElement;
    
    // যদি কোনো বাকি টাকা থাকে, তাহলে সাপ্লায়ার তালিকা দেখান
    const hasDue = Object.values(suppliers).some(due => due > 0);
    
    if (hasDue) {
        let listHTML = `
            <div class="supplier-list">
                <p style="margin-bottom: 10px; font-size: 14px; color: #666;">বাকি টাকা আছে এমন সাপ্লায়ার:</p>
        `;
        
        Object.keys(suppliers).forEach(supplier => {
            const due = suppliers[supplier];
            if (due > 0) {
                listHTML += `
                    <div class="supplier-item" onclick="selectSupplier('${supplier}')">
                        <span class="supplier-name">${supplier}</span>
                        <span class="supplier-due">${formatNumber(due)} টাকা বাকি</span>
                    </div>
                `;
            }
        });
        
        listHTML += `</div>`;
        
        // বিদ্যমান লিস্ট সরান
        const existingList = container.querySelector('.supplier-list');
        if (existingList) existingList.remove();
        
        container.insertAdjacentHTML('beforeend', listHTML);
    }
}

// সাপ্লায়ার নির্বাচন করুন
function selectSupplier(supplierName) {
    document.getElementById('supplierPaymentSupplier').value = supplierName;
    updateSupplierDueAmount();
    
    // আইটেম নির্বাচিত স্টাইল দিন
    const items = document.querySelectorAll('.supplier-item');
    items.forEach(item => {
        item.classList.remove('selected');
        if (item.querySelector('.supplier-name').textContent === supplierName) {
            item.classList.add('selected');
        }
    });
}

// সাপ্লায়ার পেমেন্ট প্রক্রিয়া
function processSupplierPayment(e) {
    e.preventDefault();
    
    const supplier = document.getElementById('supplierPaymentSupplier').value;
    const amount = parseFloat(document.getElementById('supplierPaymentAmount').value) || 0;
    const mode = document.getElementById('supplierPaymentMode').value;
    const date = document.getElementById('supplierPaymentDate').value;
    const notes = document.getElementById('supplierPaymentNotes').value;
    const bankDetails = document.getElementById('bankDetails')?.value || '';
    const mobileDetails = document.getElementById('mobileBankingDetails')?.value || '';
    
    if (!supplier) {
        alert('দয়া করে সাপ্লায়ার নাম প্রদান করুন!');
        return;
    }
    
    if (amount <= 0) {
        alert('দয়া করে সঠিক পেমেন্ট পরিমাণ প্রদান করুন!');
        return;
    }
    
    if (!mode) {
        alert('দয়া করে পেমেন্ট মোড নির্বাচন করুন!');
        return;
    }
    
    const data = dataManager.loadData();
    
    // সাপ্লায়ারের মোট বাকি টাকা চেক
    let totalDue = 0;
    data.purchases.forEach(purchase => {
        if (purchase.supplier === supplier) {
            totalDue += (purchase.dueAmount || 0);
        }
    });
    
    if (amount > totalDue) {
        if (!confirm(`সাপ্লায়ারের বাকি টাকা ${formatNumber(totalDue)} টাকা, কিন্তু আপনি ${formatNumber(amount)} টাকা পেমেন্ট করতে চাচ্ছেন। আপনি কি নিশ্চিত?`)) {
            return;
        }
    }
    
    // পেমেন্ট রেকর্ড তৈরি করুন
    const paymentRecord = {
        id: 'PAY_' + Date.now(),
        type: 'supplier',
        supplier: supplier,
        amount: amount,
        mode: mode,
        date: date,
        notes: notes,
        bankDetails: bankDetails,
        mobileDetails: mobileDetails,
        timestamp: new Date().toISOString()
    };
    
    // পেমেন্ট হিস্ট্রিতে যোগ করুন
    if (!data.payments) {
        data.payments = [];
    }
    data.payments.push(paymentRecord);
    
    // ক্রয়ের বাকি টাকা আপডেট করুন
    updatePurchaseDueAfterPayment(supplier, amount, data);
    
    // ডেটা সেভ করুন
    dataManager.saveAllData(data);
    
    alert(`সফলভাবে ${formatNumber(amount)} টাকা পেমেন্ট রেকর্ড করা হয়েছে!`);
    
    // ফর্ম রিসেট করুন
    document.getElementById('addSupplierPaymentForm').reset();
    updateSupplierDueAmount();
    hideAllPaymentSections();
    
    // সংশ্লিষ্ট তালিকা আপডেট করুন
    loadPurchases();
    updateProfitLossSummary();
    updateDataStatus();
}

// ক্রয়ের বাকি টাকা আপডেট করুন
function updatePurchaseDueAfterPayment(supplier, paymentAmount, data) {
    let remainingPayment = paymentAmount;
    
    // পুরানো ক্রয় থেকে শুরু করে বাকি টাকা কমান
    data.purchases.forEach(purchase => {
        if (remainingPayment <= 0) return;
        
        if (purchase.supplier === supplier && purchase.dueAmount > 0) {
            const due = purchase.dueAmount || 0;
            const payment = Math.min(due, remainingPayment);
            
            purchase.dueAmount = due - payment;
            purchase.paidAmount = (purchase.paidAmount || 0) + payment;
            remainingPayment -= payment;
        }
    });
    
    // যদি অতিরিক্ত পেমেন্ট থাকে, তাহলে নতুন ক্রয় হিসেবে রেকর্ড করুন
    if (remainingPayment > 0) {
        data.purchases.push({
            productId: 'ADVANCE',
            productName: 'অগ্রিম পেমেন্ট',
            purchasePrice: 0,
            quantity: 1,
            supplier: supplier,
            totalAmount: 0,
            paidAmount: remainingPayment,
            dueAmount: -remainingPayment, // নেগেটিভ মানে আমরা তাদের কাছে পাওনা
            date: new Date().toISOString().split('T')[0]
        });
    }
}

// ক্রেতা পেমেন্ট প্রক্রিয়া
function processCustomerPayment(e) {
    e.preventDefault();
    
    const customerId = document.getElementById('customerPaymentCustomerId').value;
    const amount = parseFloat(document.getElementById('customerPaymentAmount').value) || 0;
    const mode = document.getElementById('customerPaymentMode').value;
    const date = document.getElementById('customerPaymentDate').value;
    const notes = document.getElementById('customerPaymentNotes').value;
    const bankDetails = document.getElementById('customerBankDetails')?.value || '';
    const mobileDetails = document.getElementById('customerMobileBankingDetails')?.value || '';
    
    if (!customerId) {
        alert('দয়া করে ক্রেতা আইডি প্রদান করুন!');
        return;
    }
    
    if (amount <= 0) {
        alert('দয়া করে সঠিক পেমেন্ট পরিমাণ প্রদান করুন!');
        return;
    }
    
    if (!mode) {
        alert('দয়া করে পেমেন্ট মোড নির্বাচন করুন!');
        return;
    }
    
    const data = dataManager.loadData();
    
    // ক্রেতার অস্তিত্ব চেক
    const customerExists = data.customers.some(c => c.id === customerId);
    if (!customerExists) {
        alert('ক্রেতা আইডি পাওয়া যায়নি! দয়া করে প্রথমে ক্রেতা যোগ করুন।');
        return;
    }
    
    // ক্রেতার মোট বাকি টাকা চেক
    let totalDue = 0;
    data.transactions.forEach(transaction => {
        if (transaction.customerId === customerId) {
            totalDue += (transaction.dueAmount || 0);
        }
    });
    
    if (amount > totalDue) {
        if (!confirm(`ক্রেতার বাকি টাকা ${formatNumber(totalDue)} টাকা, কিন্তু আপনি ${formatNumber(amount)} টাকা পেমেন্ট গ্রহণ করতে চাচ্ছেন। আপনি কি নিশ্চিত?`)) {
            return;
        }
    }
    
    // পেমেন্ট রেকর্ড তৈরি করুন
    const paymentRecord = {
        id: 'PAY_' + Date.now(),
        type: 'customer',
        customerId: customerId,
        amount: amount,
        mode: mode,
        date: date,
        notes: notes,
        bankDetails: bankDetails,
        mobileDetails: mobileDetails,
        timestamp: new Date().toISOString()
    };
    
    // পেমেন্ট হিস্ট্রিতে যোগ করুন
    if (!data.payments) {
        data.payments = [];
    }
    data.payments.push(paymentRecord);
    
    // বিক্রয়ের বাকি টাকা আপডেট করুন
    updateTransactionDueAfterPayment(customerId, amount, data);
    
    // ডেটা সেভ করুন
    dataManager.saveAllData(data);
    
    alert(`সফলভাবে ${formatNumber(amount)} টাকা পেমেন্ট রেকর্ড করা হয়েছে!`);
    
    // ফর্ম রিসেট করুন
    document.getElementById('addCustomerPaymentForm').reset();
    updateCustomerDueAmount();
    hideAllPaymentSections();
    
    // সংশ্লিষ্ট তালিকা আপডেট করুন
    loadTransactions();
    updateProfitLossSummary();
    updateDataStatus();
}

// বিক্রয়ের বাকি টাকা আপডেট করুন
function updateTransactionDueAfterPayment(customerId, paymentAmount, data) {
    let remainingPayment = paymentAmount;
    
    // পুরানো ট্র্যানজেকশন থেকে শুরু করে বাকি টাকা কমান
    data.transactions.forEach(transaction => {
        if (remainingPayment <= 0) return;
        
        if (transaction.customerId === customerId && transaction.dueAmount > 0) {
            const due = transaction.dueAmount || 0;
            const payment = Math.min(due, remainingPayment);
            
            transaction.dueAmount = due - payment;
            transaction.paidAmount = (transaction.paidAmount || 0) + payment;
            remainingPayment -= payment;
        }
    });
    
    // যদি অতিরিক্ত পেমেন্ট থাকে, তাহলে অগ্রিম হিসাবে রেকর্ড করুন
    if (remainingPayment > 0) {
        data.transactions.push({
            customerId: customerId,
            productId: 'ADVANCE',
            quantity: 1,
            unitPrice: 0,
            purchasePrice: 0,
            profitLoss: 0,
            totalAmount: 0,
            paidAmount: remainingPayment,
            dueAmount: -remainingPayment, // নেগেটিভ মানে ক্রেতার কাছে আমাদের পাওনা
            date: new Date().toISOString().split('T')[0],
            type: 'advance_payment'
        });
    }
}

// পেমেন্ট হিস্ট্রি লোড করুন
function loadPaymentHistory() {
    const data = dataManager.loadData();
    const payments = data.payments || [];
    
    // ফিল্টার প্রয়োগ
    const type = document.getElementById('paymentHistoryType').value;
    const period = document.getElementById('paymentHistoryPeriod').value;
    const startDate = document.getElementById('paymentStartDate')?.value;
    const endDate = document.getElementById('paymentEndDate')?.value;
    
    let filteredPayments = payments;
    
    // ধরন অনুযায়ী ফিল্টার
    if (type !== 'all') {
        filteredPayments = filteredPayments.filter(p => p.type === type);
    }
    
    // তারিখ অনুযায়ী ফিল্টার
    filteredPayments = filterPaymentsByDate(filteredPayments, period, startDate, endDate);
    
    // হিস্ট্রি ডিসপ্লে
    const historyContainer = document.getElementById('paymentHistoryList');
    
    if (filteredPayments.length === 0) {
        historyContainer.innerHTML = `
            <div style="text-align: center; padding: 40px; color: #666; background: #f8f9fa; border-radius: 8px;">
                <i class="fas fa-receipt" style="font-size: 48px; margin-bottom: 15px; opacity: 0.5;"></i>
                <p style="font-size: 16px;">কোনো পেমেন্ট রেকর্ড পাওয়া যায়নি</p>
            </div>
        `;
        return;
    }
    
    // সামারি হিসাব
    let totalSupplierPayments = 0;
    let totalCustomerPayments = 0;
    
    filteredPayments.forEach(payment => {
        if (payment.type === 'supplier') {
            totalSupplierPayments += payment.amount;
        } else {
            totalCustomerPayments += payment.amount;
        }
    });
    
    let historyHTML = `
        <div style="margin-bottom: 20px; padding: 15px; background: #f8f9fa; border-radius: 8px;">
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px;">
                <div style="background: white; padding: 15px; border-radius: 5px; border-left: 4px solid #28a745;">
                    <h5 style="margin: 0 0 10px 0; color: #28a745;">সাপ্লায়ার পেমেন্ট</h5>
                    <div style="font-size: 24px; font-weight: bold;">${formatNumber(totalSupplierPayments)} টাকা</div>
                    <div style="font-size: 12px; color: #666;">${filteredPayments.filter(p => p.type === 'supplier').length} টি পেমেন্ট</div>
                </div>
                <div style="background: white; padding: 15px; border-radius: 5px; border-left: 4px solid #17a2b8;">
                    <h5 style="margin: 0 0 10px 0; color: #17a2b8;">ক্রেতা পেমেন্ট</h5>
                    <div style="font-size: 24px; font-weight: bold;">${formatNumber(totalCustomerPayments)} টাকা</div>
                    <div style="font-size: 12px; color: #666;">${filteredPayments.filter(p => p.type === 'customer').length} টি পেমেন্ট</div>
                </div>
            </div>
        </div>
        
        <div style="max-height: 400px; overflow-y: auto;">
    `;
    
    // পেমেন্ট রেকর্ড সাজানো (নতুন থেকে পুরানো)
    filteredPayments.sort((a, b) => new Date(b.date) - new Date(a.date));
    
    filteredPayments.forEach(payment => {
        const paymentClass = payment.type === 'supplier' ? 'supplier' : 'customer';
        const paymentTitle = payment.type === 'supplier' ? 'সাপ্লায়ার পেমেন্ট' : 'ক্রেতা পেমেন্ট';
        const paymentColor = payment.type === 'supplier' ? '#28a745' : '#17a2b8';
        const paymentIcon = payment.type === 'supplier' ? 'fa-user-tie' : 'fa-users';
        
        // পেমেন্ট মোড বেজ ক্লাস
        const modeClass = `payment-${payment.mode}`;
        const modeText = getPaymentModeText(payment.mode);
        
        // বিস্তারিত তথ্য
        let details = '';
        if (payment.bankDetails) {
            details += `ব্যাংক: ${payment.bankDetails}<br>`;
        }
        if (payment.mobileDetails) {
            details += `মোবাইল: ${payment.mobileDetails}<br>`;
        }
        if (payment.notes) {
            details += `মন্তব্য: ${payment.notes}`;
        }
        
        // ক্রেতা/সাপ্লায়ার নাম
        let targetName = payment.type === 'supplier' ? payment.supplier : 
                        (payment.customerId ? `${payment.customerId} - ${getCustomerName(payment.customerId)}` : 'Unknown');
        
        historyHTML += `
            <div class="payment-record ${paymentClass}">
                <div style="display: flex; justify-content: space-between; align-items: flex-start;">
                    <div>
                        <div style="font-weight: bold; color: ${paymentColor}; margin-bottom: 5px;">
                            <i class="fas ${paymentIcon}" style="margin-right: 8px;"></i>
                            ${paymentTitle}
                        </div>
                        <div style="font-size: 14px; margin-bottom: 5px;">
                            <strong>${targetName}</strong>
                        </div>
                        <div style="font-size: 12px; color: #666; margin-bottom: 5px;">
                            <i class="far fa-calendar-alt" style="margin-right: 5px;"></i>
                            ${payment.date}
                        </div>
                        ${details ? `<div class="payment-details">${details}</div>` : ''}
                    </div>
                    <div style="text-align: right;">
                        <div style="font-size: 20px; font-weight: bold; color: ${payment.type === 'supplier' ? '#dc3545' : '#28a745'};">
                            ${formatNumber(payment.amount)} টাকা
                        </div>
                        <div style="margin-top: 5px;">
                            <span class="payment-method ${modeClass}">${modeText}</span>
                        </div>
                        <div style="font-size: 10px; color: #999; margin-top: 5px;">
                            ${payment.id}
                        </div>
                    </div>
                </div>
            </div>
        `;
    });
    
    historyHTML += `</div>`;
    historyContainer.innerHTML = historyHTML;
}

// বাকি টাকা সারাংশ লোড করুন
function loadDueSummary() {
    const data = dataManager.loadData();
    const purchases = data.purchases || [];
    const transactions = data.transactions || [];
    
    // সাপ্লায়ার অনুযায়ী বাকি টাকা হিসাব
    const supplierDue = {};
    purchases.forEach(purchase => {
        if (purchase.supplier && purchase.dueAmount > 0) {
            if (!supplierDue[purchase.supplier]) {
                supplierDue[purchase.supplier] = 0;
            }
            supplierDue[purchase.supplier] += purchase.dueAmount;
        }
    });
    
    // ক্রেতা অনুযায়ী বাকি টাকা হিসাব
    const customerDue = {};
    transactions.forEach(transaction => {
        if (transaction.customerId && transaction.dueAmount > 0) {
            if (!customerDue[transaction.customerId]) {
                customerDue[transaction.customerId] = 0;
            }
            customerDue[transaction.customerId] += transaction.dueAmount;
        }
    });
    
    // মোট বাকি টাকা
    const totalSupplierDue = Object.values(supplierDue).reduce((sum, due) => sum + due, 0);
    const totalCustomerDue = Object.values(customerDue).reduce((sum, due) => sum + due, 0);
    const netDue = totalCustomerDue - totalSupplierDue;
    
    // সারাংশ ডিসপ্লে
    const summaryContainer = document.getElementById('dueSummaryContent');
    
    let summaryHTML = `
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 20px;">
            <div class="due-summary-card supplier">
                <h5 style="color: #28a745; margin-bottom: 15px; display: flex; align-items: center;">
                    <i class="fas fa-user-tie" style="margin-right: 10px;"></i>
                    সাপ্লায়ার বাকি টাকা
                </h5>
                <div class="due-amount" style="color: #dc3545;">${formatNumber(totalSupplierDue)} টাকা</div>
                <div style="font-size: 14px; color: #666; margin-bottom: 15px;">
                    ${Object.keys(supplierDue).length} জন সাপ্লায়ার
                </div>
            </div>
            
            <div class="due-summary-card customer">
                <h5 style="color: #17a2b8; margin-bottom: 15px; display: flex; align-items: center;">
                    <i class="fas fa-users" style="margin-right: 10px;"></i>
                    ক্রেতা বাকি টাকা
                </h5>
                <div class="due-amount" style="color: #28a745;">${formatNumber(totalCustomerDue)} টাকা</div>
                <div style="font-size: 14px; color: #666; margin-bottom: 15px;">
                    ${Object.keys(customerDue).length} জন ক্রেতা
                </div>
            </div>
        </div>
        
        <div class="due-summary-card" style="background: linear-gradient(135deg, #f8f9fa, #e8f4f8);">
            <h5 style="color: #2a5298; margin-bottom: 15px; display: flex; align-items: center;">
                <i class="fas fa-balance-scale" style="margin-right: 10px;"></i>
                নেট বাকি টাকা অবস্থা
            </h5>
            <div class="due-amount ${netDue >= 0 ? 'due-positive' : ''}" style="font-size: 32px;">
                ${netDue >= 0 ? '+' : ''}${formatNumber(netDue)} টাকা
            </div>
            <div style="font-size: 14px; color: #666;">
                ${netDue >= 0 ? 'ক্রেতাদের কাছ থেকে নেট পাওনা' : 'সাপ্লায়ারদের কাছে নেট দেনা'}
            </div>
        </div>
    `;
    
    // সাপ্লায়ার তালিকা
    if (Object.keys(supplierDue).length > 0) {
        summaryHTML += `
            <div class="due-summary-card" style="margin-top: 20px;">
                <h5 style="color: #28a745; margin-bottom: 15px;">সাপ্লায়ার অনুযায়ী বাকি টাকা</h5>
                <div class="supplier-list">
        `;
        
        // বাকি টাকা অনুযায়ী সাজান (বেশি থেকে কম)
        const sortedSuppliers = Object.keys(supplierDue).sort((a, b) => supplierDue[b] - supplierDue[a]);
        
        sortedSuppliers.forEach(supplier => {
            const due = supplierDue[supplier];
            summaryHTML += `
                <div class="supplier-item">
                    <span class="supplier-name">${supplier}</span>
                    <span class="supplier-due">${formatNumber(due)} টাকা</span>
                </div>
            `;
        });
        
        summaryHTML += `
                </div>
            </div>
        `;
    }
    
    // ক্রেতা তালিকা
    if (Object.keys(customerDue).length > 0) {
        summaryHTML += `
            <div class="due-summary-card" style="margin-top: 20px;">
                <h5 style="color: #17a2b8; margin-bottom: 15px;">ক্রেতা অনুযায়ী বাকি টাকা</h5>
                <div class="customer-list">
        `;
        
        // বাকি টাকা অনুযায়ী সাজান (বেশি থেকে কম)
        const sortedCustomers = Object.keys(customerDue).sort((a, b) => customerDue[b] - customerDue[a]);
        
        sortedCustomers.forEach(customerId => {
            const due = customerDue[customerId];
            const customerName = getCustomerName(customerId);
            summaryHTML += `
                <div class="customer-item">
                    <span class="customer-name">${customerId} - ${customerName}</span>
                    <span class="customer-due">${formatNumber(due)} টাকা</span>
                </div>
            `;
        });
        
        summaryHTML += `
                </div>
            </div>
        `;
    }
    
    summaryContainer.innerHTML = summaryHTML;
}

// পেমেন্ট তারিখ অনুযায়ী ফিল্টার
function filterPaymentsByDate(payments, period, startDate, endDate) {
    let filteredPayments = payments;
    
    if (period === 'daily') {
        const today = new Date().toISOString().split('T')[0];
        filteredPayments = filteredPayments.filter(p => p.date === today);
    } else if (period === 'monthly') {
        const currentMonth = new Date().toISOString().substring(0, 7);
        filteredPayments = filteredPayments.filter(p => p.date.startsWith(currentMonth));
    } else if (period === 'custom' && startDate && endDate) {
        filteredPayments = filteredPayments.filter(p => p.date >= startDate && p.date <= endDate);
    }
    // 'all' এর জন্য কোন ফিল্টার প্রয়োগ করবে না
    
    return filteredPayments;
}

// পেমেন্ট মোড টেক্সট
function getPaymentModeText(mode) {
    const modeMap = {
        'cash': 'নগদ',
        'bank': 'ব্যাংক',
        'bkash': 'বিকাশ',
        'nagad': 'নগদ',
        'check': 'চেক'
    };
    return modeMap[mode] || mode;
}

// পেমেন্ট হিস্ট্রি প্রিন্ট
function printPaymentHistory() {
    const historyContainer = document.getElementById('paymentHistoryList');
    const title = "পেমেন্ট হিস্ট্রি - SA Traders";
    
    const printWindow = window.open('', '_blank');
    printWindow.document.write(`
        <!DOCTYPE html>
        <html>
        <head>
            <title>${title}</title>
            <style>
                body { font-family: Arial, sans-serif; margin: 20px; }
                h1 { color: #2a5298; text-align: center; }
                table { border-collapse: collapse; width: 100%; font-size: 12px; margin-top: 20px; }
                th, td { border: 1px solid #000; padding: 8px; text-align: left; }
                th { background-color: #f2f2f2; }
                .supplier { color: #28a745; }
                .customer { color: #17a2b8; }
                .summary { margin-top: 20px; padding: 15px; background: #f8f9fa; border: 1px solid #ddd; }
            </style>
        </head>
        <body>
            <h1>${title}</h1>
            <div>প্রিন্ট তারিখ: ${new Date().toLocaleDateString('bn-BD')}</div>
            ${historyContainer.innerHTML}
        </body>
        </html>
    `);
    printWindow.document.close();
    printWindow.print();
}

// বাকি টাকা সারাংশ প্রিন্ট
function printDueSummary() {
    const summaryContainer = document.getElementById('dueSummaryContent');
    const title = "বাকি টাকা সারাংশ - SA Traders";
    
    const printWindow = window.open('', '_blank');
    printWindow.document.write(`
        <!DOCTYPE html>
        <html>
        <head>
            <title>${title}</title>
            <style>
                body { font-family: Arial, sans-serif; margin: 20px; }
                h1 { color: #2a5298; text-align: center; }
                .summary-box { border: 1px solid #ddd; padding: 15px; margin: 10px 0; }
                .supplier { border-left: 4px solid #28a745; }
                .customer { border-left: 4px solid #17a2b8; }
                .due-amount { font-size: 24px; font-weight: bold; margin: 10px 0; }
                .positive { color: #28a745; }
                .negative { color: #dc3545; }
                table { border-collapse: collapse; width: 100%; font-size: 12px; margin-top: 10px; }
                th, td { border: 1px solid #000; padding: 6px; }
                th { background-color: #f2f2f2; }
            </style>
        </head>
        <body>
            <h1>${title}</h1>
            <div>প্রিন্ট তারিখ: ${new Date().toLocaleDateString('bn-BD')}</div>
            ${summaryContainer.innerHTML}
        </body>
        </html>
    `);
    printWindow.document.close();
    printWindow.print();
}

// ============================================
// ড্যাশবোর্ড ইনিশিয়ালাইজেশনে পেমেন্ট সেকশন যোগ করুন
// ============================================

// বিদ্যমান initializeDashboard ফাংশন আপডেট করুন
const originalInitializeDashboard = initializeDashboard;
initializeDashboard = function() {
    originalInitializeDashboard();
    addPaymentManagementSection();
};

// বিদ্যমান ফাংশনে পেমেন্ট ডেটা যোগ করুন
const originalDataValidation = dataManager.validateData;
dataManager.validateData = function(data) {
    const isValid = originalDataValidation.call(this, data);
    
    // পেমেন্ট ডেটা চেক করুন
    if (!data.payments) {
        data.payments = [];
    }
    
    return isValid;
};

// প্রাথমিক ডেটা লোড হলে পেমেন্ট সেকশন যোগ করুন
if (document.getElementById('dashboard').style.display === 'block') {
    addPaymentManagementSection();
}