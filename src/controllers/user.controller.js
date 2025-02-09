import { Contact } from "../models/contact.model.js";
import { APIError } from "../utils/APIError.js";
import { APIResponse } from "../utils/APIResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { Op } from "sequelize";

const linkContacts = asyncHandler(async (req,res) => {
    const { email, phoneNumber } = req.body;

    if(!email && !phoneNumber){
      throw new APIError(400,"Either Email or Phone Number must be provided.");
    }
  
      let existingContacts = [];
      if(email){
        existingContacts = await Contact.findAll({
          where: {
            email,
          },
        });
      }
      if(phoneNumber){
        const phoneContacts = await Contact.findAll({
          where: {
            phoneNumber,
          },
        });
        existingContacts = [...existingContacts, ...phoneContacts];
      }
      console.log(existingContacts.map(contact => contact.dataValues));
      
      if(existingContacts.length === 0){
        const newContact = await Contact.create({
          email: email || null,
          phoneNumber: phoneNumber || null,
          linkedId: null,
          linkPrecedence: 'primary',
        });
  
        return res.status(200).json(new APIResponse(200,{
          contact: {
            primaryContactId: newContact.id,
            emails: email ? [email] : [],
            phoneNumbers: phoneNumber ? [phoneNumber] : [],
            secondaryContactIds: [],
          },
        },"Contact Created Successfully"));
      }

      const primaryContacts = existingContacts.filter(contact => contact.linkPrecedence === 'primary');

    if(primaryContacts.length > 1){
      const sortedPrimaryContacts = primaryContacts.sort((a, b) => a.createdAt - b.createdAt);
    
      const newPrimaryContact = sortedPrimaryContacts[0];
      const newSecondaryContact = sortedPrimaryContacts[1];

      newSecondaryContact.linkPrecedence = 'secondary';
      newSecondaryContact.linkedId = newPrimaryContact.id;
      await newSecondaryContact.save();

      existingContacts = existingContacts.filter(contact => contact.id !== newSecondaryContact.id);
      existingContacts.push(newPrimaryContact, newSecondaryContact);
    }
  
      const primaryContact = existingContacts.sort((a, b) => a.createdAt - b.createdAt)[0];
      
      if((email && primaryContact.email !== email) || 
        (phoneNumber && primaryContact.phoneNumber !== phoneNumber)){
        await Contact.create({
          email: email || null,
          phoneNumber: phoneNumber || null,
          linkedId: primaryContact.id,
          linkPrecedence: 'secondary',
        });
      }

      const secondaryContactIds = await Contact.findAll({
        where: {
          linkedId: {
            [Op.eq]: primaryContact.id,
          },
        },
      });

    const result = {
      primaryContactId: primaryContact.id,
      emails:[primaryContact.email,...secondaryContactIds.map(contacts => contacts.email).filter(email => email)].filter((value, index, self) => self.indexOf(value) === index),
      phoneNumbers:[primaryContact.phoneNumber,...secondaryContactIds.map(contacts => contacts.phoneNumber).filter(number => number)].filter((value, index, self) => self.indexOf(value) === index),
      secondaryContactIds: secondaryContactIds.map(contact => contact.id)
    };
  
    return res.status(200).json(new APIResponse(200,{ contact: result },"Links Fetched Successfully."));
});

export {linkContacts}