(() => {
    const contactForm = document.getElementById('contact-form');
    const contactStatus = document.getElementById('contact-status');

    if (contactForm) {
        contactForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const name = document.getElementById('contact-name').value.trim();
            const email = document.getElementById('contact-email').value.trim();
            const subject = document.getElementById('contact-subject').value;
            const message = document.getElementById('contact-message').value.trim();
            
            // Validate email format
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(email)) {
                showContactStatus('Please enter a valid email address.', 'error');
                return;
            }
            
            // Show loading state
            const submitBtn = contactForm.querySelector('button[type="submit"]');
            const originalText = submitBtn.textContent;
            submitBtn.disabled = true;
            submitBtn.textContent = 'Sending...';
            
            // Simulate sending (in a real application, this would send to a backend)
            // For now, we'll just show a success message
            setTimeout(() => {
                // In a real implementation, you would send this data to your backend
                // For example: await fetch('/api/contact', { method: 'POST', body: JSON.stringify({ name, email, subject, message }) })
                
                console.log('Contact form submission:', { name, email, subject, message });
                
                showContactStatus('Thank you for your message! We will get back to you as soon as possible.', 'success');
                contactForm.reset();
                
                submitBtn.disabled = false;
                submitBtn.textContent = originalText;
            }, 1000);
        });
    }
    
    function showContactStatus(message, type) {
        if (!contactStatus) return;
        
        contactStatus.textContent = message;
        contactStatus.className = `contact-status ${type}`;
        contactStatus.style.display = 'block';
        
        // Scroll to status message
        contactStatus.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        
        // Hide after 5 seconds for success messages
        if (type === 'success') {
            setTimeout(() => {
                contactStatus.style.display = 'none';
            }, 5000);
        }
    }
})();

