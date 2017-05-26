// ==UserScript==
// @name         HF Infinity Scroller
// @version      0.0.1
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
    } else if (this.id == 'posts'){;
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
    this.end  = parseInt($('.pagination_next').prev().get(0).innerText);
    this.base = window.location.href.split('&page')[0];
    $guide = $('.pagination').html(''); // remove the html
    $guide.append(`<span><b>Pages (${this.end}): </b></span>`);
    if (this.page != 1){
        $guide.append(`<a href="${this.base+'&page='+(this.page-1)}" class="pagination_previous" style="margin-right: 5px;">« Previous</a>`);
    }
    if (1){
      for (var i = 1; i < this.end+1; i++){ // look at this, show the 7th page not the sixth
          if (i > 5 && this.end != 6){
             $guide.append(`<span id="spacer1"><b>... </b></span"><div class="middle_ground" style="display: none;"><a href="#" class="pagination_page" style="margin-right: 5px;">0</a></div><span id="spacer2" style="display:none"><b>... </b></span>`);
             $guide.append(`<a href="${this.base+'&page='+this.end}" class="${(i==this.end) ? 'pagination_current':'pagination_page'}" style="margin-right: 5px;">${this.end}</a>`);
             break;
          }
        $guide.append(`<a href="${this.base+'&page='+i}" class="${(i==this.page) ? 'pagination_current':'pagination_page'}" style="margin-right: 5px;">${i}</a>`);
      }
    }
    if (this.end != this.page){
        $guide.append(`<a href="${this.base+'&page='+(this.page+1)}" class="pagination_next">Next »</a>`);
    }
    this.canContinue = this.page < this.end;
    this.beingUsed = false;
    this.next = function(){
      this.canContinue = ++this.page < this.end;
      $('.pagination_current').attr('class', 'pagination_page').next().attr('class', 'pagination_current');
      //if (this.page >){

      //}
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
   lastPost = posts.get(-2);
  $(window).scroll(function() {
    // Fixed Header Handler
    if (window.scrollY > fixedBarY) {
      fixedBar.width(posts.width()+3);
      fixedBar.css({position: 'fixed', top: '0px', background: '#333333'});
    } else {
      fixedBar.width('inherit');
      fixedBar.css({position: 'relative', background: 'none'});
    }
    // Dynamic Post Handler
    if (Page.isNext() && (lastPost.getBoundingClientRect().top < $(window).height())){
      Page.beingUsed = true;
      try {
        $.ajax(Page.next()).done(function(html){
          try {
            $('#posts').append($(DOMify(html)).find('#posts').children());
          } catch(e) {console.log(e);}
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


