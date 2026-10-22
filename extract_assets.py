import os
from PIL import Image
import numpy as np

os.makedirs('public/assets/categories', exist_ok=True)
os.makedirs('public/assets/products', exist_ok=True)
os.makedirs('public/assets/banners', exist_ok=True)
os.makedirs('public/assets/heritage', exist_ok=True)
os.makedirs('public/assets/brand', exist_ok=True)
os.makedirs('public/assets/testimonials', exist_ok=True)

# 1. Page 1 (Desktop Homepage) - 1536 x 1024
p1 = Image.open('extracted_raw_images/raw_page_01.jpg')
w1, h1 = p1.size

# Logo
# In header: roughly x: 420 to 600, y: 35 to 90
logo = p1.crop((420, 35, 600, 92))
logo.save('public/assets/brand/dorasani_logo.png')

# Lotus mark
lotus = p1.crop((495, 36, 526, 60))
lotus.save('public/assets/brand/lotus_mark.png')

# Hero Model (right side of hero)
hero_model = p1.crop((560, 140, 1100, 455))
hero_model.save('public/assets/banners/hero_model.jpg')

# Hero Full Banner
hero_banner = p1.crop((0, 130, 1175, 455))
hero_banner.save('public/assets/banners/hero_banner.jpg')

# Category Cards on Homepage (Row at y: 505 to 645)
# 7 arched cards:
# Centers roughly at x: 50, 130, 220, 305, 390, 475, 560
# Let's inspect coordinates of category cards:
cat_crops = [
    ('cat_sarees.jpg', (56, 502, 130, 622)),
    ('cat_silk_sarees.jpg', (140, 502, 214, 622)),
    ('cat_ethnic_wear.jpg', (225, 502, 299, 622)),
    ('cat_lehengas.jpg', (309, 502, 383, 622)),
    ('cat_festive.jpg', (394, 502, 468, 622)),
    ('cat_new_arrivals.jpg', (479, 502, 553, 622)),
    ('cat_bestsellers.jpg', (563, 502, 637, 622)),
]
for fname, box in cat_crops:
    p1.crop(box).save(f'public/assets/categories/{fname}')

# Banner 'A Celebration of Our Heritage' (y: 470 to 650, x: 648 to 975)
p1.crop((648, 470, 975, 660)).save('public/assets/banners/celebration_heritage_banner.jpg')

# Banner 'A Legacy of Beauty' (y: 680 to 895, x: 575 to 905)
p1.crop((575, 680, 905, 898)).save('public/assets/banners/legacy_beauty_banner.jpg')

# Homepage New Arrivals Products (4 cards):
# Product 1: Kanjivaram Silk Saree (box: 58, 705, 172, 835)
p1.crop((58, 705, 172, 835)).save('public/assets/products/kanjivaram_silk_saree.jpg')
# Product 2: Organza Floral Saree (box: 185, 705, 299, 835)
p1.crop((185, 705, 299, 835)).save('public/assets/products/organza_floral_saree.jpg')
# Product 3: Banarasi Silk Saree (box: 312, 705, 426, 835)
p1.crop((312, 705, 426, 835)).save('public/assets/products/banarasi_silk_saree.jpg')
# Product 4: Chanderi Cotton Saree (box: 439, 705, 553, 835)
p1.crop((439, 705, 553, 835)).save('public/assets/products/chanderi_cotton_saree.jpg')

# Trust Strip / Floral Footer Trim
p1.crop((0, 915, 1175, 985)).save('public/assets/brand/trust_strip_desktop.jpg')
p1.crop((0, 975, 1175, 1024)).save('public/assets/brand/floral_bottom_trim.jpg')
p1.crop((0, 0, 1175, 30)).save('public/assets/brand/top_banner_bg.jpg')

# 2. Page 2 (Mobile Homepage) - Priya S. Testimonial photo
p2 = Image.open('extracted_raw_images/raw_page_02.jpg')
# Priya S photo in lehenga
p2.crop((770, 400, 905, 520)).save('public/assets/testimonials/priya_s.jpg')
# Mobile bottom footer floral background
p2.crop((480, 890, 959, 980)).save('public/assets/brand/mobile_footer_floral.jpg')

# 3. Page 3 (Shop All) Products
p3 = Image.open('extracted_raw_images/raw_page_03.jpg')
# Row 2 products:
p3.crop((237, 665, 388, 835)).save('public/assets/products/tussar_silk_saree.jpg')
p3.crop((416, 665, 567, 835)).save('public/assets/products/organza_tissue_saree.jpg')
p3.crop((596, 665, 747, 835)).save('public/assets/products/kanchipuram_bridal_saree.jpg')
p3.crop((776, 665, 927, 835)).save('public/assets/products/linen_silk_saree.jpg')

# 4. Page 5 (Ethnic Wear) Products
p5 = Image.open('extracted_raw_images/raw_page_05.jpg')
p5.crop((267, 265, 377, 408)).save('public/assets/products/embroidered_anarkali.jpg')
p5.crop((388, 265, 498, 408)).save('public/assets/products/chanderi_kurti_set.jpg')
p5.crop((509, 265, 619, 408)).save('public/assets/products/organza_sharara_set.jpg')
p5.crop((631, 265, 741, 408)).save('public/assets/products/silk_salwar_suit.jpg')
p5.crop((267, 355, 377, 498)).save('public/assets/products/festive_coord_set.jpg')
p5.crop((388, 355, 498, 498)).save('public/assets/products/ethnic_gown.jpg')
p5.crop((509, 355, 619, 498)).save('public/assets/products/rayon_kurti_set.jpg')
p5.crop((631, 355, 741, 498)).save('public/assets/products/printed_anarkali.jpg')

# Circular ethnic subcategories:
p5.crop((273, 212, 313, 240)).save('public/assets/categories/sub_kurtis.jpg')
p5.crop((330, 212, 370, 240)).save('public/assets/categories/sub_anarkali.jpg')
p5.crop((388, 212, 428, 240)).save('public/assets/categories/sub_sharara.jpg')
p5.crop((445, 212, 485, 240)).save('public/assets/categories/sub_salwar.jpg')
p5.crop((503, 212, 543, 240)).save('public/assets/categories/sub_gowns.jpg')
p5.crop((560, 212, 600, 240)).save('public/assets/categories/sub_coords.jpg')

# 5. Page 6 (Lehengas) Products
p6 = Image.open('extracted_raw_images/raw_page_06.jpg')
p6.crop((256, 260, 352, 385)).save('public/assets/products/bridal_silk_lehenga.jpg')
p6.crop((361, 260, 457, 385)).save('public/assets/products/wedding_lehenga_set.jpg')
p6.crop((468, 260, 564, 385)).save('public/assets/products/designer_lehenga.jpg')
p6.crop((578, 260, 674, 385)).save('public/assets/products/pastel_organza_lehenga.jpg')
p6.crop((256, 335, 352, 460)).save('public/assets/products/embroidered_lehenga.jpg')
p6.crop((361, 335, 457, 460)).save('public/assets/products/reception_lehenga.jpg')
p6.crop((468, 335, 564, 460)).save('public/assets/products/festive_lehenga.jpg')
p6.crop((578, 335, 674, 460)).save('public/assets/products/velvet_lehenga_set.jpg')

# 6. Page 10 (Mythology & Heritage) Artwork
p10 = Image.open('extracted_raw_images/raw_page_10.jpg')
# Goddesses of Grace
p10.crop((155, 378, 296, 428)).save('public/assets/heritage/goddesses_of_grace.jpg')
# Temple Architecture
p10.crop((302, 378, 442, 428)).save('public/assets/heritage/temple_architecture.jpg')
# Classical Arts
p10.crop((448, 378, 588, 428)).save('public/assets/heritage/classical_arts.jpg')
# Nature & Heritage
p10.crop((593, 378, 734, 428)).save('public/assets/heritage/nature_heritage.jpg')
# Our Heritage image (temple columns)
p10.crop((125, 268, 382, 348)).save('public/assets/heritage/heritage_columns.jpg')

# 7. Page 11 (Product Details)
p11 = Image.open('extracted_raw_images/raw_page_11.jpg')
# Main large product image
p11.crop((205, 155, 460, 460)).save('public/assets/products/product_main_large.jpg')
# Thumbnails
p11.crop((154, 160, 198, 203)).save('public/assets/products/thumb_1.jpg')
p11.crop((154, 212, 198, 255)).save('public/assets/products/thumb_2.jpg')
p11.crop((154, 264, 198, 307)).save('public/assets/products/thumb_3.jpg')
p11.crop((154, 316, 198, 359)).save('public/assets/products/thumb_4.jpg')
p11.crop((154, 368, 198, 411)).save('public/assets/products/thumb_5.jpg')
# Blouse piece callout
p11.crop((600, 350, 735, 410)).save('public/assets/products/blouse_piece.jpg')

print('Successfully extracted all high-fidelity images into public/assets/!')
