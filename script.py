from bs4 import BeautifulSoup
import requests
import markdownify
from supabase import create_client, Client
from openai import OpenAI
from selenium import webdriver
from selenium.webdriver.chrome.service import Service
from selenium.webdriver.common.by import By
from webdriver_manager.chrome import ChromeDriverManager
import time
import os

url: str = os.environ.get("SUPABASE_URL")
key: str = os.environ.get("SUPABASE_KEY")
supabase: Client = create_client(url, key)
OPENAI_API_KEY = os.environ.get("OPENAI_API_KEY")


def get_markdown(url):
    response = requests.get(url)
    return markdownify.markdownify(response.text)


def get_html_selenium(url):
    options = webdriver.ChromeOptions()
    options.add_argument("--headless")
    options.add_argument("--disable-gpu")
    service = Service(ChromeDriverManager().install())
    driver = webdriver.Chrome(service=service, options=options)
    driver.get(url)
    time.sleep(2)
    html = driver.page_source
    driver.quit()
    return html


def get_icon(url):
    response = get_html_selenium(url)
    soup = BeautifulSoup(response, "html.parser")
    icon = soup.find("link", rel="icon")
    if not icon:
        return None

    href = icon["href"]

    if not href:
        return None

    if not str(href).startswith("http") or not str(href).startswith("https"):
        return url + href

    return href


def get_title(url):
    client = OpenAI(api_key=OPENAI_API_KEY)
    response = get_html_selenium(url)
    soup = BeautifulSoup(response, "html.parser")
    title = str(soup.find("title"))
    completion = client.chat.completions.create(
        model="gpt-3.5-turbo",
        messages=[
            {
                "role": "system",
                "content": "As an AI assistant well-versed in all company names, your primary task is to extract and return only the company name from the provided information. Respond exclusively with the company name. If certainty about the exact name eludes you, provide your best informed guess based on the available data.",
            },
            {"role": "user", "content": title},
        ],
    )

    return completion.choices[0].message.content or "Title"


def write_in_file(file_name="./terms/terms.md", content=""):
    with open("./terms/" + file_name, "w", encoding="utf-8") as file:
        file.write(content)


def read_terms_from_file(file_name):
    with open(file_name, "r") as file:
        terms = file.read()
        return terms.strip()


def get_last_websites():
    latest_websites = (
        supabase.table("websites")
        .select("url, terms_url, terms")
        .order("id", desc=False)
        .execute()
    )
    return latest_websites.data


def update_website(name, url, image_url, terms_url, terms, file_with_terms):
    data, count = (
        supabase.table("websites")
        .update(
            {
                "name": name,
                "image_url": image_url,
                "terms": read_terms_from_file("./terms/" + file_with_terms),
            }
        )
        .eq("url", url)
        .execute()
    )


if __name__ == "__main__":
    while True:
        try:
            websites = get_last_websites()
            for website in websites:
                if website["terms"]:
                    continue
                print(f"Processing {website['url']}")
                url = website["url"]
                terms_url = website["terms_url"]
                markdown = get_markdown(terms_url)
                title = get_title(url) or "Title"
                image_url = get_icon(url)
                write_in_file(file_name=title + ".md", content=markdown)
                update_website(
                    title, url, image_url, terms_url, markdown, title + ".md"
                )
        except Exception as e:
            print(e)

        time.sleep(5)
