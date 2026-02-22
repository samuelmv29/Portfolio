// Small JS for nav toggle and year
document.addEventListener('DOMContentLoaded',()=>{
  const navToggle=document.getElementById('navToggle');
  const siteNav=document.getElementById('siteNav');
  navToggle?.addEventListener('click',()=>{
    document.documentElement.classList.toggle('nav-open');
  });
  // set current year
  const y=document.getElementById('year'); if(y) y.textContent=new Date().getFullYear();
  // smooth scroll for internal links
  document.querySelectorAll('a[href^="#"]').forEach(a=>{
    a.addEventListener('click',e=>{
      const href=a.getAttribute('href');
      if(href && href.startsWith('#')){
        const el=document.querySelector(href);
        if(el){ e.preventDefault(); el.scrollIntoView({behavior:'smooth',block:'start'}); document.documentElement.classList.remove('nav-open'); }
      }
    })
  })

  // Contact copy buttons
  document.querySelectorAll('.copy-btn').forEach(btn => {
    btn.addEventListener('click', function(e) {
      const value = btn.getAttribute('data-copy');
      if (value) {
        navigator.clipboard.writeText(value).then(() => {
          const icon = btn.querySelector('.copy-icon');
          if (icon) {
            icon.style.display = 'none';
            let check = document.createElement('span');
            check.textContent = '✔';
            check.style.fontSize = '1.1em';
            check.style.color = 'var(--accent-light)';
            btn.appendChild(check);
            setTimeout(() => {
              btn.removeChild(check);
              icon.style.display = '';
            }, 1200);
          }
        });
      }
    });
  });

  // Typewriter: small reusable implementation
  var TxtType = function(el, toRotate, period) {
    this.toRotate = toRotate;
    this.el = el;
    this.loopNum = 0;
    this.period = parseInt(period, 10) || 2000;
    this.txt = '';
    this.isDeleting = false;
    this.tick();
  };

  TxtType.prototype.tick = function() {
    var i = this.loopNum % this.toRotate.length;
    var fullTxt = this.toRotate[i];

    // typing or deleting
    if (this.isDeleting) {
      this.txt = fullTxt.substring(0, this.txt.length - 1);
    } else {
      this.txt = fullTxt.substring(0, this.txt.length + 1);
    }

    var wrap = this.el.querySelector('.wrap');
    if (wrap) wrap.innerHTML = this.txt;

    var that = this;
    // faster base speed for typing; randomize a bit
    var delta = 100 - Math.random() * 40;
    if (this.isDeleting) { delta = 40 - Math.random() * 20; }

    // when full text reached: pause with blinking caret, then start deleting
    if (!this.isDeleting && this.txt === fullTxt) {
      // add paused class to enable CSS blink
      this.el.classList.add('paused');
      setTimeout(function() {
        that.el.classList.remove('paused');
        that.isDeleting = true;
        that.tick();
      }, this.period);
      return;
    }

    // when fully deleted: small pause then go to next string
    if (this.isDeleting && this.txt === '') {
      this.isDeleting = false;
      this.loopNum++;
      setTimeout(function() {
        that.tick();
      }, 300);
      return;
    }

    setTimeout(function() {
      that.tick();
    }, delta);
  };

  // initialize any .typewrite elements found in the page
  (function initTypewrite(){
    var elements = document.getElementsByClassName('typewrite');
    for (var i=0; i<elements.length; i++) {
      var toRotate = elements[i].getAttribute('data-type');
      var period = elements[i].getAttribute('data-period');
      if (toRotate) {
        new TxtType(elements[i], JSON.parse(toRotate), period);
      }
    }
  })();

  // Education expand/collapse toggle
  (function educationToggle(){
    var toggles = document.getElementsByClassName('expand-toggle');
    Array.prototype.forEach.call(toggles, function(btn){
      var targetId = btn.getAttribute('aria-controls');
      var content = document.getElementById(targetId);
      btn.addEventListener('click', function(){
        var expanded = btn.getAttribute('aria-expanded') === 'true';
        btn.setAttribute('aria-expanded', String(!expanded));
        if(content){
          content.classList.toggle('expanded');
        }
      });
    });
  })();

  // Projects filtering
  (function projectsFilter(){
    var filterTags = document.querySelectorAll('.filter-tag');
    var projectCards = document.querySelectorAll('.project-card');
    var projectCount = document.getElementById('projectCount');
    var activeFilters = new Set(['all']);

    function updateFilters(clickedTag){
      var tag = clickedTag.getAttribute('data-tag');
      
      if(tag === 'all'){
        activeFilters.clear();
        activeFilters.add('all');
        filterTags.forEach(function(btn){
          if(btn.getAttribute('data-tag') === 'all'){
            btn.classList.add('active');
          } else {
            btn.classList.remove('active');
          }
        });
      } else {
        var allBtn = document.querySelector('.filter-tag[data-tag="all"]');
        if(allBtn) allBtn.classList.remove('active');
        activeFilters.delete('all');
        
        if(activeFilters.has(tag)){
          activeFilters.delete(tag);
          clickedTag.classList.remove('active');
        } else {
          activeFilters.add(tag);
          clickedTag.classList.add('active');
        }
        
        if(activeFilters.size === 0){
          activeFilters.add('all');
          if(allBtn) allBtn.classList.add('active');
        }
      }
      
      filterProjects();
    }

    function filterProjects(){
      var visibleCount = 0;
      var featuredProjects = [];
      var otherProjects = [];
      
      projectCards.forEach(function(card){
        var cardTags = card.getAttribute('data-tags').split(' ');
        var isFeatured = cardTags.includes('featured');
        var matches = false;
        
        if(activeFilters.has('all')){
          matches = true;
        } else {
          matches = Array.from(activeFilters).some(function(filter){
            return cardTags.includes(filter);
          });
        }
        
        if(matches){
          if(isFeatured){
            featuredProjects.push(card);
          } else {
            otherProjects.push(card);
          }
          visibleCount++;
        }
        
        card.classList.toggle('hidden', !matches);
      });
      
      // Reorder: featured first, then others
      var grid = document.querySelector('.projects-grid');
      if(grid){
        featuredProjects.forEach(function(card){
          grid.appendChild(card);
        });
        otherProjects.forEach(function(card){
          grid.appendChild(card);
        });
      }
      
      if(projectCount){
        projectCount.textContent = visibleCount;
      }
    }

    filterTags.forEach(function(btn){
      btn.addEventListener('click', function(){
        updateFilters(btn);
      });
    });
    
    // Initial filter
    filterProjects();
  })();

  // Interactive Skills Cloud
  (function interactiveSkillsCloud(){
    var skillItems = document.querySelectorAll('.skill-item');
    
    skillItems.forEach(function(skill){
      skill.addEventListener('mouseenter', function(e){
        var hoveredSkill = e.target;
        var rect = hoveredSkill.getBoundingClientRect();
        var centerX = rect.left + rect.width / 2;
        var centerY = rect.top + rect.height / 2;
        
        skillItems.forEach(function(otherSkill){
          if(otherSkill !== hoveredSkill){
            var otherRect = otherSkill.getBoundingClientRect();
            var otherCenterX = otherRect.left + otherRect.width / 2;
            var otherCenterY = otherRect.top + otherRect.height / 2;
            
            var dx = otherCenterX - centerX;
            var dy = otherCenterY - centerY;
            var distance = Math.sqrt(dx * dx + dy * dy);
            
            if(distance < 120){
              var force = (120 - distance) / 120;
              var angle = Math.atan2(dy, dx);
              var moveX = Math.cos(angle) * force * 12;
              var moveY = Math.sin(angle) * force * 12;
              
              otherSkill.style.transform = 'translate(' + moveX + 'px, ' + moveY + 'px)';
              otherSkill.style.transition = 'transform 0.3s ease-out';
            }
          }
        });
        
        hoveredSkill.style.transform = 'scale(1.1)';
        hoveredSkill.style.transition = 'transform 0.3s ease-out';
      });
      
      skill.addEventListener('mouseleave', function(e){
        skillItems.forEach(function(item){
          item.style.transform = '';
        });
      });
    });
  })();

});
