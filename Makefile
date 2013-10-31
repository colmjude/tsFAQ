deploy:
	compass compile --no-line-comments --force
	tsapp push faq
