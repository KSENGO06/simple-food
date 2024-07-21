
    window.addEventListener('scroll', function() {
        const header = document.querySelector('.header');
        const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
        
        if (scrollTop > 50) { // Змінити 50 на висоту, при якій хедер стає фіксованим
            header.classList.add('header__fixed');
        } else {
            header.classList.remove('header__fixed');
        }
    });


var mixer = mixitup('.popular__categories-content');