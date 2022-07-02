from ast import Name
import io
import os
import csv
import ssl
import smtplib
import time
import tkinter as tk
from tkinter import filedialog
from dotenv import load_dotenv
from PyPDF2 import PdfFileWriter, PdfFileReader
from reportlab.pdfgen import canvas
from reportlab.lib.pagesizes import letter
from os.path import basename
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from email.mime.application import MIMEApplication

load_dotenv()
SENDER_MAIL = os.getenv("SENDER_EMAIL")
SENDER_PASSWORD = os.getenv("SENDER_PASSWORD")

def MenuUI():
    space1 = ' ' * 2
    menuItemList = ["PDF Watermarker and Mailer ©", "Email: pasinduakalpa1998@gmail.com",
                    "LinkedIn: https://www.linkedin.com/in/pasinduakalpa/", "Select PDF File",
                    "Select Receiver List (CSV)", "Send Email", "Exit Programme"]
    print(
        f"+{'-' * 55}+\n|\t{' ' * 8}{menuItemList[0]}{' ' * 10}\t|\n|{' ' * 55}|\n|\t{' ' * 3}{menuItemList[1]}{' ' * 8}\t|\n|{' ' * 2}{menuItemList[2]}\t|\n+{'-' * 55}+")
    print(
        f"|{space1 + '1' + space1}|{space1 + menuItemList[3]}{' ' * 32}|\n|{space1 + '2' + space1}|{space1 + menuItemList[4]}{' ' * 21}|")
    print(
        f"|{space1 + '3' + space1}|{space1 + menuItemList[5]}{' ' * 37}|\n|{space1 + 'q' + space1}|{space1 + menuItemList[6]}{' ' * 33}|")


def MenuInputValidation():
    global save_exist
    validInputList = ['1', '2', '3', 'q', 'Q']
    choiceList = ['y', 'Y', 'n', 'N']
    option = '0'
    newline = '\n' * 2
    while option not in validInputList[-2:]:
        MenuUI()
        save_exist = os.path.exists('save.txt')
        if save_exist:
            while True:
                choice = str(input("Save File Found! Do you want to continue it? (y/N)"))
                if choice in choiceList:
                    if choice == 'y' or choice == 'Y':
                        Continue_Operation()
                    else:
                        break
                else:
                    print("Invalid Input")

        option = str(input(f"+{'-' * 5}+{'-' * 49}+\nPlease Select an Option: "))
        toPrint = f'{option} Selected!'
        if option not in validInputList:
            print(f"Invalid option selected!!\nPlease Enter Option (1 , 2 , 3 ,q or Q){newline}")
        else:
            if option == '1':
                toPrint
                PDF_Reader()
                newline
            elif option == '2':
                toPrint
                CSV_Reader()
                newline
            elif option == '3':
                toPrint
                Prepare()
                newline
    print(f'{toPrint}\nProgram Terminated.')


def Continue_Operation():
    global pdf_orientation
    global pdf_height
    global pdf_width
    global pdf_path
    global pdf_valid
    global csv_valid
    global csv_path
    global pdf_name
    global row_iter
    global row_count
    pdf_valid = True
    csv_valid = True
    loadList = []
    with open(r'save.txt', 'r') as fp:
        for line in fp:
            x = line[:-1]
            loadList.append(x)
    pdf_path = loadList[0]
    csv_path = loadList[1]
    row_iter = loadList[2]
    row_count = int(loadList[3])
    pdf_orientation = loadList[4]
    pdf_height = float(loadList[5])
    pdf_width = float(loadList[6])
    pdf_name = loadList[7]
    with open(csv_path, 'r') as file:
        csv_reader = csv.reader(file, delimiter=',')
        iteration = 0
        for row in csv_reader:
            if iteration >= int(row_iter):
                Edit_And_Send(row[0], row[2])
            iteration += 1
    if save_exist:
        os.remove("save.txt")
        time.sleep(1)


def PDF_Reader():
    global pdf_valid
    global pdf_path
    global pdf_name
    global pdf_height
    global pdf_width
    global pdf_orientation

    while True:
        root = tk.Tk()
        root.withdraw()
        pdf_path = filedialog.askopenfilename()
        path, fileName = os.path.split(pdf_path)
        pdf_name = fileName.split('.')[0]
        if fileName.endswith('.pdf'):
            break
        else:
            pdf_valid = False
            print("Invalid File Type")
    pdf_reader = PdfFileReader(pdf_path)
    pdf_width = pdf_reader.pages[0].mediabox[2]
    pdf_height = pdf_reader.pages[0].mediabox[3]
    deg = pdf_reader.getPage(0).get('/Rotate')
    page = pdf_reader.getPage(0).mediaBox
    if page.getUpperRight_x() - page.getUpperLeft_x() > page.getUpperRight_y() - page.getLowerRight_y():
        if deg in [0, 180, None]:
            pdf_orientation = 'L'
        else:
            pdf_orientation = 'P'
    else:
        if deg in [0, 180, None]:
            pdf_orientation = 'P'
        else:
            pdf_orientation = 'L'
    pdf_valid = True
    print("File Read Successful")


def CSV_Reader():
    global csv_valid
    global csv_path
    global row_count
    global csv_reader
    while True:
        root = tk.Tk()
        root.withdraw()
        csv_path = filedialog.askopenfilename()
        path, fileName = os.path.split(csv_path)
        if fileName.endswith('.csv'):
            break
        else:
            csv_valid = False
            print("Invalid File Type")
    with open(csv_path, 'r') as file:
        csv_reader = csv.reader(file, delimiter=',')
        row_count = sum(1 for row in csv_reader)
    if row_count == 0:
        csv_valid = False
        print("Empty CSV File")
    else:
        csv_valid = True
    print("File Read Successful")


def Prepare():
    global row_iter
    if pdf_valid:
        if csv_valid:
            # try:
                with open(csv_path, 'r') as file:
                    csv_reader = csv.reader(file, delimiter=',')
                    iteration = 0
                    print("PDF Watermarking & Mailing Process Started!\nPlease Wait...")
                    for row in csv_reader:
                        # print(f"{row[0]} : {row[2]}")
                        row_iter = str(iteration)
                        Edit_And_Send(row[0], row[2])
                        iteration += 1
                print("Process Completed!")
                if save_exist:
                    os.remove("save.txt")
                    time.sleep(1)
            # except:
            #     print("Unknown Exception Occured!")
        else:
            print("Valid CSV not found!")
    else:
        print("Valid PDF not found!")


def Edit_And_Send(code, email):
    packet = io.BytesIO()
    if pdf_orientation == 'P':
        can = canvas.Canvas(packet, pagesize=letter)
        can.setFillColorRGB(0, 0, 0)
        can.setFont("Helvetica-Bold", 8)
        can.drawString(60, 50, code)
        can.rotate(90)
        can.drawString(int(pdf_height / 2), -int(pdf_width - 10), code)
        can.save()
    elif pdf_orientation == 'L':
        can = canvas.Canvas(packet, pagesize=letter)
        can.setFillColorRGB(0, 0, 0)
        can.setFont("Helvetica-Bold", 12)
        can.drawString(60, 25, code)
        can.rotate(90)
        can.drawString(int(pdf_height / 2), -int(pdf_width / 2 + 15), code)
        can.save()
    
    packet.seek(0)
    new_pdf = PdfFileReader(packet)
    output = PdfFileWriter()
    pdf_reader = PdfFileReader(pdf_path)
    for i in range(0, pdf_reader.numPages):
        page = pdf_reader.getPage(i)
        if i == 0:
            page.mergePage(pdf_reader.getPage(i))
        else:
            page.mergePage(new_pdf.getPage(0))
        output.addPage(page)

    outputStream = open(f"{pdf_name}{code}.pdf", "wb")
    output.write(outputStream)
    outputStream.close()

    from_addr = SENDER_MAIL
    to_addr = email
    subject = f"{pdf_name} PDF"
    content = f"""{pdf_name} PDF Attached to this Email"""

    mail = MIMEMultipart()
    mail.add_header('From', from_addr)
    mail.add_header('To', to_addr)
    mail.add_header('Subject', subject)
    body = MIMEText(content, 'plain')
    mail.attach(body)

    fileName = f"{pdf_name}{code}.pdf"

    with open(fileName, 'rb') as f:
        part = MIMEApplication(f.read(), Name=basename(fileName))
        part['Content-Disposition'] = 'attachment; filename="{}"'.format(basename(fileName))
    mail.attach(part)

    context = ssl.create_default_context()

    with smtplib.SMTP_SSL('smtp.gmail.com', 465, context=context) as smtp:
        smtp.login(SENDER_MAIL, SENDER_PASSWORD)
        print(f"Sending Mail... to {email}")
        smtp.send_message(mail, from_addr=from_addr, to_addrs=[to_addr])
    
    os.remove(fileName)

    saveList = [pdf_path, csv_path, row_iter, str(row_count), pdf_orientation, pdf_height, pdf_width, pdf_name]
    with open(r"save.txt", "w") as fp:
        for item in saveList:
            fp.write("%s\n" % item)


MenuInputValidation()
