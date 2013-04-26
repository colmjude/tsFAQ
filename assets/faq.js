;(function($) {
	"use strict";
	var fetched = false,
		ts_faqs = [],
		tw_faqs = [],
		faqtmpl,
		faqtmplsource = [
			'<dl class="faq closed">',
				'<dt>{{title}}</dt>',
				'<dd>{{answer}}</dd>',
			'</dl>'
		].join("\n");

	$.getJSON("http://faq.tiddlyspace.com/tiddlers.json?select=tag:FAQ&fat=1", function(resp) {
		if(resp) {
			_.each(resp, function(item, index, remaining) {
				if( _.contains(item.tags, "tiddlyspace") ) {
					ts_faqs.push( item );
				}
				if( _.contains(item.tags, "tiddlywiki") ) {
					tw_faqs.push( item );
				}
			});
			fetched = true;
			$.event.trigger("fetched");
		}
	});

	function generateFAQSection(type) {
		var faqList = (type && type === "tiddlywiki") ? tw_faqs : ts_faqs;
		var icon = $("<i></i>").addClass("icon-double-angle-right");
		var section = $("<section></section>")
						.addClass("open")
						.append( $("<header></header>").append( $("<h2></h2>", {"text":type, "class": "open"}).append(icon) ) );
		var faqwrap = $("<article></article>");
		_.each(faqList, function(faq, index, list) {
			var data = {
				title: faq.title,
				answer: faq.text
			};
			faqwrap
				.append( faqtmpl(data) )
				.appendTo(section);
		});
		return section;
	}

	$(function() {
		faqtmpl = Handlebars.compile(faqtmplsource);
		var $main = $("#main");

		function renderBothSets() {
			$main.append(generateFAQSection('tiddlyspace'));
			$main.append(generateFAQSection('tiddlywiki'));
		}

		if(fetched) {
			renderBothSets();
		} else {
			$( document ).bind("fetched", "#main", function() {
				renderBothSets();
			});
		}

		$main.on("click", "dt", function(e) {
			var $this = $(this);
			$this.siblings().toggle().toggleClass('hidden');
		});

		
	});
}(jQuery));
