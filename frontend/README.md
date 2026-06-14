# Nambikkai Healthcare - Frontend

A vanilla HTML/CSS/JavaScript frontend for the Nambikkai Healthcare API, designed with learning best practices in mind. Built with minimal dependencies and maximum clarity.

## 📁 Project Structure

```
frontend/
├── html/                      # All HTML pages
│   ├── index.html            # Login/Role Selection (entry point)
│   ├── dashboard.html        # Main dashboard (role-based)
│   ├── patients.html         # Patient management (CRUD)
│   ├── doctors.html          # Doctor management (CRUD)
│   ├── appointments.html     # Appointment booking & management
│   ├── medical-records.html  # Medical records management
│   └── clinical-orders.html  # Clinical orders management
├── css/
│   └── style.css            # All CSS (custom + Pico CSS inspired)
└── js/
    ├── api.js               # API service (centralized fetch wrapper)
    ├── auth.js              # Authentication service (localStorage)
    └── utils.js             # Utility functions (DOM, formatting, etc.)
```

## 🚀 Getting Started

### Prerequisites
- Backend API running on `localhost:3000`
- Modern web browser (Chrome, Firefox, Safari, Edge)
- No build tools needed!

### Setup

1. Open `frontend/html/index.html` in your browser
2. Select a role (Patient, Doctor, or Admin)
3. Click "Enter as Selected Role" to start

**Note:** This uses localStorage for demo authentication - just select a role and start exploring!

## 🎯 Features by Role

### Admin
- ✅ View/Create/Edit/Delete Patients
- ✅ View/Create/Edit/Delete Doctors
- ✅ View/Create/Edit/Delete Appointments
- ✅ View/Create/Edit/Delete Medical Records
- ✅ View/Create/Edit/Delete Clinical Orders
- ✅ System-wide overview & statistics

### Doctor
- ✅ View patient list
- ✅ View appointments
- ✅ Create/view medical records
- ✅ Create/view clinical orders

### Patient
- ✅ Book appointments
- ✅ View appointments
- ✅ View medical records
- ✅ View clinical orders
- ✅ Find doctors

## 📚 Architecture & Best Practices

### 1. **API Service Layer** (`js/api.js`)
Centralized API communication with all backend endpoints wrapped in a clean interface.

```javascript
// Usage
const patients = await ApiService.getPatients();
await ApiService.createPatient({ first_name: 'John', ... });
```

**Benefits:**
- Single point for all API logic
- Easy error handling
- Simple to mock for testing
- Maintainable endpoints

### 2. **Authentication Service** (`js/auth.js`)
Simple localStorage-based auth for demo purposes.

```javascript
// Login with a role
AuthService.login('admin');

// Check if logged in
if (AuthService.isLoggedIn()) { ... }

// Get current user
const user = AuthService.getCurrentUser();
```

### 3. **UI Utilities** (`js/utils.js`)
Reusable functions for common UI operations.

```javascript
// Formatting
UIUtils.formatDate(date);
UIUtils.formatDateTime(datetime);

// UI Feedback
UIUtils.showSuccess('Done!');
UIUtils.showError(container, 'Failed!');

// Validation
UIUtils.isValidEmail(email);
UIUtils.isValidPhone(phone);
```

### 4. **CSS Architecture** (`css/style.css`)
Clean, semantic CSS with CSS variables for easy theming.

```css
:root {
  --color-primary: #0066cc;
  --color-success: #28a745;
  --color-danger: #dc3545;
  /* ... more variables ... */
}
```

**Components:**
- Typography
- Forms & Inputs
- Tables
- Cards & Badges
- Alerts & Notifications
- Responsive Grid
- Utility Classes

## 🎨 Design System

### Colors
- **Primary:** #0066cc (Blue)
- **Success:** #28a745 (Green)
- **Danger:** #dc3545 (Red)
- **Warning:** #ffc107 (Yellow)
- **Info:** #17a2b8 (Cyan)

### Status Badges
- Scheduled (Blue)
- Completed (Green)
- Cancelled (Red)
- Pending (Yellow)

### Gender Badges
- Male (Blue)
- Female (Pink)
- Other (Purple)

## 🔄 Workflow Examples

### Booking an Appointment (Patient Flow)
1. Login as "Patient"
2. Click "Book Appointment" in sidebar
3. Select patient and doctor from dropdowns
4. Choose date & time
5. Add reason for visit (optional)
6. Click "Book Appointment"

### Creating Medical Record (Doctor Flow)
1. Login as "Doctor"
2. Click "Medical Records" in sidebar
3. Click "+ Create Record"
4. Select patient and fill in symptoms/diagnosis
5. Click "Create Record"
6. Record appears in list

### Managing System (Admin Flow)
1. Login as "Admin"
2. Navigate to any module (Patients, Doctors, etc.)
3. Use CRUD forms to manage data
4. View system statistics on dashboard

## 🧪 End-to-End Testing Scenarios

### Scenario 1: New Patient Appointment
1. **Admin:** Create a new patient (John, DOB: 1990-01-15, M)
2. **Admin:** Create a new doctor (Dr. Smith, Cardiologist)
3. **Patient:** Book appointment with Dr. Smith
4. **Doctor:** View appointment in their list
5. **Admin:** Confirm appointment status in admin view

### Scenario 2: Medical Record Creation
1. **Patient:** Exist in system
2. **Doctor:** Create medical record for patient
3. **Doctor:** Add symptoms and diagnosis
4. **Patient:** View their medical record
5. **Admin:** Verify record exists in system

### Scenario 3: Clinical Order Flow
1. **Doctor:** Create clinical order (Lab Test)
2. **Patient:** View order in their list
3. **Admin:** Change order status to "Completed"
4. **Patient:** See updated status

## 📝 Key Learning Points

### 1. Vanilla JavaScript (No Frameworks)
- DOM manipulation without jQuery
- Fetch API for async requests
- ES6 classes for services
- Event delegation
- Async/await patterns

### 2. Frontend Architecture
- Service-oriented design
- Single responsibility principle
- Separation of concerns
- Reusable utilities

### 3. Form Handling
- Form validation
- Error display
- Loading states
- Success feedback
- Textarea resizing

### 4. Responsive Design
- Mobile-first CSS
- Flexible grid layout
- Media queries
- Responsive tables

### 5. State Management
- localStorage for session
- In-memory data caching
- Form state handling
- Navigation state

## 🛠️ Customization

### Add New Page
1. Create `feature-name.html` in `html/` folder
2. Copy template from existing page
3. Update navigation links
4. Add API calls using `ApiService`
5. Style using existing CSS classes

### Change Colors
Edit CSS variables in `css/style.css`:

```css
:root {
  --color-primary: #your-color;
  /* ... other colors ... */
}
```

### Add New API Endpoint
Add method to `ApiService` class in `js/api.js`:

```javascript
static getNewFeature(id) {
  return this.request(`/new-feature/${id}`);
}
```

## 🔗 API Integration

All API calls go through `ApiService` class:

```javascript
// Get all resources
const data = await ApiService.getPatients();

// Get single resource
const patient = await ApiService.getPatient(1);

// Create
await ApiService.createPatient({ first_name: 'John', ... });

// Update
await ApiService.updatePatient(1, { first_name: 'Jane', ... });

// Delete
await ApiService.deletePatient(1);
```

## 🚨 Error Handling

All API errors are caught and displayed:

```javascript
try {
  await ApiService.getPatients();
} catch (error) {
  UIUtils.showWarning('Error: ' + error.message);
}
```

## 📱 Browser Support

- Chrome/Edge: Latest 2 versions
- Firefox: Latest 2 versions
- Safari: Latest 2 versions
- Mobile browsers: iOS Safari, Chrome Mobile

## 🧹 Code Quality

- No external dependencies
- Vanilla JavaScript ES6+
- Comments on all functions
- Consistent naming conventions
- Single responsibility principle

## 📖 Learning Resources

This project teaches:
- How to build APIs (backend)
- How to consume APIs (frontend)
- Vanilla JavaScript best practices
- HTML/CSS fundamentals
- Form handling & validation
- Responsive design
- Component-based thinking
- Service layer architecture

## 🤝 Contributing

To add features:
1. Follow existing code patterns
2. Add functions to service layer
3. Create UI components with existing CSS
4. Test with multiple roles
5. Document changes in this README

## 📄 License

ISC

---

**Happy Learning!** 🎓
