;(function(exports, $) {
	"use strict";

    function FAQs() {
        this.fetched = false;
        this.faqtmpl = undefined;
        this.ts_faqs = [];
        this.tw_faqs = [];
    }

    FAQs.prototype.init = function(tiddlyweb) {
        this.userIsMember = (tiddlyweb.status.space.recipe.match(/_private$/)) ? true : false;
        this.faqtmpl = Handlebars.compile($("#faq-template").html());
        this.$main = $("#main");
        this.bindUIEvents();
        this.fetchFAQs();
    };

    FAQs.prototype.fetchFAQs = function() {
        var context = this;
        $.getJSON("http://faq.tiddlyspace.com/tiddlers.json?select=tag:FAQ&fat=1&render=1", function(resp) {
            if(resp) {
                _.each(resp, function(item, index, remaining) {
                    if( _.contains(item.tags, "TiddlySpace") ) {
                        context.ts_faqs.push( item );
                    }
                    if( _.contains(item.tags, "TiddlyWiki") ) {
                        context.tw_faqs.push( item );
                    }
                });
                context.fetched = true;
                $.event.trigger("fetched");
            }
        });
    };

    FAQs.prototype.createEditLink = function(tidTitle) {
        var twS = tiddlyweb.status,
            twServer = twS.server_host;
        if( twS.username === "GUEST" ) {
            return "#";
        } else {
            return twServer.scheme + "://" + twS.space.name + "." + 
                        twServer.host + "/edit#" + tidTitle;
        }
    };

    FAQs.prototype.generateFAQSection = function(type) {
        var context = this;
        var faqList = (type && type === "tiddlywiki") ? context.tw_faqs : context.ts_faqs;
        var header = $("<header></header>").append( $("<h2></h2>", {"text":type, "class": "open"}) ),
            section = $("<section></section>")
                        .attr("id", type)
                        .addClass("open")
                        .append( header ),
            faqwrap = $("<article></article>").appendTo(section);

        _.each(faqList, function(faq, index, list) {
            var data = {
                title: faq.title,
                href: context.createEditLink( faq.title ),
                userIsMember: context.userIsMember
            };

            $( context.faqtmpl(data) )
                .find("dd")
                    .append( faq.render )
                    .end()
                .appendTo(faqwrap);

        });
        return section;
    };

    FAQs.prototype.bindUIEvents = function() {
        var context = this;
        $( document ).bind("fetched", "#main", function() {
            $("body").addClass("fetched");
            context.renderBothSets();
        });
        context.$main.on("click", "dt", function(e) {
            $(this)
                .parent('dl')
                    .toggleClass('closed');
        });
    };

    FAQs.prototype.renderBothSets = function() {
        this.$main.append(this.generateFAQSection('tiddlyspace'));
        this.$main.append(this.generateFAQSection('tiddlywiki'));
        $("#main").sieve({ itemSelector: "dl", textSelector: "dt", searchInput: $("#faqSearch") });
    };

    exports.FAQs = new FAQs();

}(window, jQuery));
