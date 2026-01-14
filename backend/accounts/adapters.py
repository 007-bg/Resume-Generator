"""
Custom adapters for social authentication.
Generates fancy unique usernames for OAuth users.
"""

import random
from allauth.socialaccount.adapter import DefaultSocialAccountAdapter
from django.contrib.auth.models import User


# Adjectives and nouns for generating usernames
ADJECTIVES = [
    "Swift", "Cosmic", "Radiant", "Stellar", "Vivid", "Noble", "Mystic", "Bright",
    "Bold", "Clever", "Daring", "Epic", "Fierce", "Grand", "Keen", "Lucky",
    "Mighty", "Prime", "Rapid", "Sharp", "Sleek", "Smart", "Sonic", "Storm",
    "Super", "Turbo", "Ultra", "Wise", "Zen", "Alpha", "Apex", "Astro",
    "Blaze", "Cipher", "Cyber", "Delta", "Echo", "Flash", "Flux", "Hyper",
    "Iron", "Jade", "Lunar", "Neo", "Nova", "Omega", "Pixel", "Pulse",
    "Quantum", "Rogue", "Shadow", "Spark", "Thunder", "Titan", "Vortex", "Zenith"
]

NOUNS = [
    "Phoenix", "Dragon", "Wolf", "Eagle", "Hawk", "Tiger", "Lion", "Falcon",
    "Raven", "Panther", "Viper", "Cobra", "Shark", "Bear", "Fox", "Owl",
    "Knight", "Ranger", "Ninja", "Wizard", "Sage", "Hunter", "Scout", "Pioneer",
    "Voyager", "Explorer", "Seeker", "Builder", "Maker", "Coder", "Hacker", "Dev",
    "Architect", "Engineer", "Artist", "Creator", "Master", "Champion", "Legend", "Hero",
    "Star", "Comet", "Meteor", "Nebula", "Galaxy", "Orbit", "Rocket", "Shuttle",
    "Thunder", "Storm", "Wave", "Flame", "Frost", "Spark", "Bolt", "Surge"
]


def generate_fancy_username():
    """Generate a unique fancy username."""
    while True:
        adj = random.choice(ADJECTIVES)
        noun = random.choice(NOUNS)
        number = random.randint(1, 999)
        username = f"{adj}{noun}{number}"
        
        # Check if username already exists
        if not User.objects.filter(username=username).exists():
            return username


class FancyUsernameAdapter(DefaultSocialAccountAdapter):
    """
    Custom adapter that generates fancy usernames for social auth users.
    """
    
    def populate_user(self, request, sociallogin, data):
        """
        Called when a new user is being created via social auth.
        Generates a fancy unique username.
        """
        user = super().populate_user(request, sociallogin, data)
        
        # Generate fancy username instead of using email prefix
        user.username = generate_fancy_username()
        
        return user
    
    def save_user(self, request, sociallogin, form=None):
        """
        Called when saving a new user from social auth.
        Ensures the username is unique.
        """
        user = super().save_user(request, sociallogin, form)
        return user
