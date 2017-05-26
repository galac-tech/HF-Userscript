// ==UserScript==
// @name         HF Infinity Scroller
// @version      0.0.2
// @description  This script dynamically adds content. It lets you scroll threads without having to load the next page manually, like facebook or instagram.
// @author       Pylon
// @match        https://hackforums.net/showthread.php?tid=*
// @require      https://cdnjs.cloudflare.com/ajax/libs/jquery/3.1.1/jquery.min.js
// @grant        none
// ==/UserScript==

// Juribiyan @ https://stackoverflow.com/questions/13389751/change-tag-using-javascript
$.fn.replaceTag = function(newTag) {
  var originalElement = this[0]
  , originalTag = originalElement.tagName
  , startRX = new RegExp('^<'+originalTag, 'i')
  , endRX = new RegExp(originalTag+'>$', 'i')
  , startSubst = '<'+newTag
  , endSubst = newTag+'>'
  , newHTML = originalElement.outerHTML
  .replace(startRX, startSubst)
  .replace(endRX, endSubst);
  this.replaceWith(newHTML);
};

function DOMify(text){
  var doc = document.createElement('document');
  doc.innerHTML = text;
  return doc;
}

function wrapFixedBar(){
  var flag = false;
  return $('.quick_keys').children().filter(function(){
    if (flag){
      return;
    } else if (this.id == 'posts'){
      flag = true;
      return;
    }
    return this;
  }).wrapAll("<div id='dynamic_header' style='z-index: 100;'></div>").parent();
}

function Pages(){
  var currentPage = $('span.pagination_current');
  this.success = currentPage.length;
  if (this.success){
    currentPage.attr('href', window.location.href).replaceTag('a');
    this.page = parseInt(currentPage.get(0).innerText);
    $next = $('.pagination_next');
    if ($next){
      this.end  = parseInt($next.prev().get(0).innerText);
    }else{
      this.end = this.page;
    }
    this.base = window.location.href.split('&page')[0];
    this.$guide = $('.pagination').attr('id', 'undynamic_bar');//.html(''); // remove the html
    this.$bar = this.$guide.first().after(`<div class="pagination" style="display:none;" id="dynamic_bar"><span><b>Pages (${this.end}): </b></span><a href="#${$('#posts a').get(0).id}" class="pagination_previous" style="margin-right: 5px;">Back to Top</a><a href="#" id="youarehere" class="pagination_current" style="margin-right: 5px;">1</a></div>`).siblings('#dynamic_bar');
    this.$pos = $("#youarehere");
    this.canContinue = this.page < this.end;
    this.beingUsed = false;
    this.next = function(){
      this.canContinue = ++this.page < this.end;
      return this.base+'&page='+this.page;
    };
    this.isNext = function(){
      return this.canContinue && !this.beingUsed;
    };
  }
}

var Page = new Pages();
if (Page.success){
   fixedBar = wrapFixedBar();
   fixedBarY = (fixedBar.position().top + 1);
   posts = $("table[id^=post]");
   $("#posts").append(`<a class="whereami" page="${Page.page}"></a>`);
   lastPost = posts.get(-2);
  $(window).scroll(function() {
    // Handels what page the user is looking at right now. <Adapted from: James Montagne @ https://stackoverflow.com/questions/6848269/using-jquery-to-find-current-visible-element-and-update-navigation > 
    $('a.whereami').each(function(){
        if($(this).offset().top > 0){
            Page.$pos.text($(this).attr('page')).attr('href', Page.base+'&page'+$(this).attr('page'));
            return false; // stops the iteration after the first one on screen
        }
    });
    // Fixed Header Handler
    if (window.scrollY > fixedBarY) {
      Page.$guide.hide();
      Page.$bar.show();
      fixedBar.width(posts.width()+3);
      fixedBar.css({position: 'fixed', top: '0px', background: '#333333'});
    } else {
      Page.$bar.hide();
      Page.$guide.show();
      fixedBar.width('inherit');
      fixedBar.css({position: 'relative', background: 'none'});
    }
    // Dynamic Post Handler
    if (Page.isNext() && (lastPost.getBoundingClientRect().top < $(window).height())){
      Page.beingUsed = true;
      try {
        $.ajax(Page.next()).done(function(html){
          try {
            console.log(Page.page);
            $('#posts').append($(DOMify(html)).find('#posts').children());
          } catch(e) {console.log(e);}
          $("#posts").append(`<a class="whereami" page="${Page.page}"></a>`);
          lastPost = $("table[id^=post]").get(-2);
          Page.beingUsed = false;
        });
      } catch(e) {console.log(e);}
    }
  }).resize(function(){
    // Fixed Header Handler (width) => damnit fixed positioning
    fixedBar.width(posts.width()+3);
  });
}


