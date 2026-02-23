from django.db import models
from django.contrib.auth.models import User
from django.utils.text import slugify

class BlogEntry(models.Model):
    STATUS_CHOICES = [
        ('draft', 'Draft'),
        ('published', 'Published'),
    ]
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    day = models.OneToOneField('journey.Day', on_delete=models.SET_NULL, null=True, blank=True, related_name='blog_entry')
    title = models.CharField(max_length=300)
    slug = models.SlugField(unique=True, blank=True, max_length=500)
    content = models.TextField()
    content_html = models.TextField(blank=True)
    learning_materials_html = models.TextField(blank=True, null=True, help_text="HTML content for learning materials")
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='draft')
    mood = models.CharField(max_length=50, blank=True)
    hours_worked = models.DecimalField(max_digits=4, decimal_places=1, null=True, blank=True)
    tags = models.JSONField(default=list)
    github_url = models.URLField(max_length=500, blank=True, null=True)
    external_links = models.JSONField(default=list, blank=True, help_text="List of dicts with title and url")
    is_public = models.BooleanField(default=True)
    published_at = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    views = models.IntegerField(default=0)

    def save(self, *args, **kwargs):
        if not self.slug:
            base_slug = slugify(f"day-{self.day.day_number}-{self.title}" if self.day else self.title)
            self.slug = base_slug
        import markdown
        self.content_html = markdown.markdown(
            self.content,
            extensions=['fenced_code', 'codehilite', 'tables', 'toc']
        )
        super().save(*args, **kwargs)

    def __str__(self):
        return self.title
